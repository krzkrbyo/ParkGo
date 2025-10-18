import * as SQLite from 'expo-sqlite';
import { BaseModel } from '../types/models';

class DatabaseClient {
  private db: SQLite.SQLiteDatabase | null = null;
  private initialized = false;

  isInitialized(): boolean {
    return this.initialized && this.db !== null;
  }

  async init(): Promise<void> {
    if (this.isInitialized()) {
      return;
    }

    try {
      this.db = await SQLite.openDatabaseAsync('parkgo.db');
      await this.createTables();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
      this.initialized = false;
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) return;
    
    try {
      // Vehicle Types table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS vehicle_types (
          id TEXT PRIMARY KEY,
          name TEXT UNIQUE NOT NULL,
          code TEXT UNIQUE NOT NULL,
          is_active BOOLEAN NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          device_id TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          deleted BOOLEAN NOT NULL DEFAULT 0
        );
      `);

      // Rate Plans table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS rate_plans (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          currency TEXT NOT NULL DEFAULT 'USD',
          rounding_minutes INTEGER NOT NULL DEFAULT 15,
          daily_max REAL NULL,
          active BOOLEAN NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          device_id TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          deleted BOOLEAN NOT NULL DEFAULT 0
        );
      `);

      // Rate Items table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS rate_items (
          id TEXT PRIMARY KEY,
          rate_plan_id TEXT NOT NULL,
          vehicle_type_id TEXT NOT NULL,
          base_minutes INTEGER NOT NULL,
          base_price REAL NOT NULL,
          add_minutes INTEGER NOT NULL,
          add_price REAL NOT NULL,
          lost_ticket_fee REAL NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          device_id TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          deleted BOOLEAN NOT NULL DEFAULT 0,
          FOREIGN KEY (rate_plan_id) REFERENCES rate_plans (id),
          FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types (id),
          UNIQUE(rate_plan_id, vehicle_type_id)
        );
      `);

      // Tickets table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS tickets (
          id TEXT PRIMARY KEY,
          status TEXT NOT NULL CHECK (status IN ('open', 'closed')),
          vehicle_type_id TEXT NOT NULL,
          plate TEXT NOT NULL,
          barcode TEXT NULL,
          entry_time TEXT NOT NULL,
          exit_time TEXT NULL,
          duration_minutes INTEGER NULL,
          rate_plan_id TEXT NOT NULL,
          total REAL NULL,
          created_by TEXT NOT NULL,
          device_id TEXT NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          deleted BOOLEAN NOT NULL DEFAULT 0,
          synced_at TEXT NULL,
          FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types (id),
          FOREIGN KEY (rate_plan_id) REFERENCES rate_plans (id)
        );
      `);

      // Payments table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS payments (
          id TEXT PRIMARY KEY,
          ticket_id TEXT NOT NULL,
          method TEXT NOT NULL CHECK (method IN ('cash')),
          amount REAL NOT NULL,
          change REAL NOT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          device_id TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          deleted BOOLEAN NOT NULL DEFAULT 0,
          FOREIGN KEY (ticket_id) REFERENCES tickets (id)
        );
      `);

      // Devices table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS devices (
          id TEXT PRIMARY KEY,
          business_name TEXT NOT NULL,
          ticket_header TEXT NOT NULL,
          location_name TEXT NOT NULL,
          printer_name TEXT NULL,
          printer_address TEXT NULL,
          scanner_mode TEXT NOT NULL CHECK (scanner_mode IN ('HID', 'CAMERA')),
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          device_id TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          deleted BOOLEAN NOT NULL DEFAULT 0
        );
      `);

      // Outbox table for sync
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS outbox (
          id TEXT PRIMARY KEY,
          table_name TEXT NOT NULL,
          row_id TEXT NOT NULL,
          op TEXT NOT NULL CHECK (op IN ('insert', 'update', 'delete')),
          payload_json TEXT NOT NULL,
          retries INTEGER NOT NULL DEFAULT 0,
          last_error TEXT NULL,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          device_id TEXT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          deleted BOOLEAN NOT NULL DEFAULT 0
        );
      `);

      // Create indexes for better performance
      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
        CREATE INDEX IF NOT EXISTS idx_tickets_plate ON tickets(plate);
        CREATE INDEX IF NOT EXISTS idx_tickets_entry_time ON tickets(entry_time);
        CREATE INDEX IF NOT EXISTS idx_outbox_created_at ON outbox(created_at);
        CREATE INDEX IF NOT EXISTS idx_outbox_retries ON outbox(retries);
      `);
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  getDatabase(): SQLite.SQLiteDatabase {
    if (!this.isInitialized()) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db!;
  }

  // Generic CRUD operations
  async insert<T extends BaseModel>(table: string, data: Omit<T, keyof BaseModel>): Promise<string> {
    const db = this.getDatabase();
    const id = this.generateULID();
    const now = new Date().toISOString();
    
    const record = {
      ...data,
      id,
      created_at: now,
      updated_at: now,
      device_id: await this.getDeviceId(),
      version: 1,
      deleted: false,
    };

    const columns = Object.keys(record).join(', ');
    const placeholders = Object.keys(record).map(() => '?').join(', ');
    const values = Object.values(record);

    await db.runAsync(`INSERT INTO ${table} (${columns}) VALUES (${placeholders})`, values);
    
    // Add to outbox for sync
    await this.addToOutbox(table, id, 'insert', JSON.stringify(record));
    
    return id;
  }

  async update<T extends BaseModel>(table: string, id: string, data: Partial<Omit<T, keyof BaseModel>>): Promise<void> {
    const db = this.getDatabase();
    const now = new Date().toISOString();
    
    const updateData = {
      ...data,
      updated_at: now,
    };

    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];

    await db.runAsync(`UPDATE ${table} SET ${setClause} WHERE id = ?`, values);
    
    // Add to outbox for sync
    const record = await this.findById(table, id);
    if (record) {
      await this.addToOutbox(table, id, 'update', JSON.stringify(record));
    }
  }

  async softDelete(table: string, id: string): Promise<void> {
    const db = this.getDatabase();
    const now = new Date().toISOString();
    
    await db.runAsync(
      `UPDATE ${table} SET deleted = 1, updated_at = ? WHERE id = ?`,
      [now, id]
    );
    
    // Add to outbox for sync
    await this.addToOutbox(table, id, 'delete', JSON.stringify({ id, deleted: true }));
  }

  async findById<T extends BaseModel>(table: string, id: string): Promise<T | null> {
    const db = this.getDatabase();
    const result = await db.getFirstAsync<T>(`SELECT * FROM ${table} WHERE id = ? AND deleted = 0`, [id]);
    return result || null;
  }

  async findAll<T extends BaseModel>(table: string, where?: string, params?: any[]): Promise<T[]> {
    const db = this.getDatabase();
    const whereClause = where ? `WHERE ${where} AND deleted = 0` : 'WHERE deleted = 0';
    const result = await db.getAllAsync<T>(`SELECT * FROM ${table} ${whereClause}`, params || []);
    return result;
  }

  async findOne<T extends BaseModel>(table: string, where: string, params?: any[]): Promise<T | null> {
    const db = this.getDatabase();
    const result = await db.getFirstAsync<T>(`SELECT * FROM ${table} WHERE ${where} AND deleted = 0`, params || []);
    return result || null;
  }

  // Outbox management
  async addToOutbox(table: string, rowId: string, operation: 'insert' | 'update' | 'delete', payload: string): Promise<void> {
    const db = this.getDatabase();
    const id = this.generateULID();
    const now = new Date().toISOString();
    
    await db.runAsync(
      `INSERT INTO outbox (id, table_name, row_id, op, payload_json, retries, last_error, created_at, updated_at, device_id, version, deleted) 
       VALUES (?, ?, ?, ?, ?, 0, NULL, ?, ?, ?, 1, 0)`,
      [id, table, rowId, operation, payload, now, now, await this.getDeviceId()]
    );
  }

  async getOutboxItems(): Promise<any[]> {
    const db = this.getDatabase();
    return await db.getAllAsync(`SELECT * FROM outbox WHERE deleted = 0 ORDER BY created_at ASC`);
  }

  async markOutboxItemSynced(id: string): Promise<void> {
    const db = this.getDatabase();
    await db.runAsync(`DELETE FROM outbox WHERE id = ?`, [id]);
  }

  async incrementOutboxRetries(id: string, error: string): Promise<void> {
    const db = this.getDatabase();
    await db.runAsync(
      `UPDATE outbox SET retries = retries + 1, last_error = ?, updated_at = ? WHERE id = ?`,
      [error, new Date().toISOString(), id]
    );
  }

  // Utility methods
  private generateULID(): string {
    // Simple ULID implementation
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${random}`.toUpperCase();
  }

  private async getDeviceId(): Promise<string> {
    const { getDeviceId } = await import('../services/ids');
    return getDeviceId();
  }

  // Transaction support
  async transaction<T>(callback: () => Promise<T>): Promise<T> {
    const db = this.getDatabase();
    await db.execAsync('BEGIN TRANSACTION');
    try {
      const result = await callback();
      await db.execAsync('COMMIT');
      return result;
    } catch (error) {
      await db.execAsync('ROLLBACK');
      throw error;
    }
  }
}

export const db = new DatabaseClient();
