import { SQLiteDatabase } from 'expo-sqlite';

export const createTables = (db: SQLiteDatabase) => {
  // Vehicle Types table
  db.execSync(`
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
  db.execSync(`
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
  db.execSync(`
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
  db.execSync(`
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
  db.execSync(`
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
  db.execSync(`
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
  db.execSync(`
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
  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_plate ON tickets(plate);
    CREATE INDEX IF NOT EXISTS idx_tickets_entry_time ON tickets(entry_time);
    CREATE INDEX IF NOT EXISTS idx_outbox_created_at ON outbox(created_at);
    CREATE INDEX IF NOT EXISTS idx_outbox_retries ON outbox(retries);
  `);
};
