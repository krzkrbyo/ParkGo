import { createClient } from '@supabase/supabase-js';
import { db } from '../db/client';
import { getStoredAuth, refreshAuth } from './auth';
import { getDeviceId } from './ids';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  errors: string[];
}

interface PushResult {
  success: boolean;
  pushed: number;
  errors: string[];
}

interface PullResult {
  success: boolean;
  pulled: number;
  errors: string[];
}

export const pushOutbox = async (): Promise<PushResult> => {
  try {
    const auth = await getStoredAuth();
    if (!auth) {
      throw new Error('No authentication found');
    }

    // Set auth header
    supabase.auth.setSession({
      access_token: auth.access_token,
      refresh_token: auth.refresh_token,
    });

    const outboxItems = await db.getOutboxItems();
    let pushed = 0;
    const errors: string[] = [];

    for (const item of outboxItems) {
      try {
        const payload = JSON.parse(item.payload_json);
        
        // Apply LWW (Last Write Wins) policy
        const { data, error } = await supabase
          .from(item.table_name)
          .upsert(payload, { 
            onConflict: 'id',
            ignoreDuplicates: false 
          });

        if (error) {
          throw new Error(error.message);
        }

        // Mark as synced
        await db.markOutboxItemSynced(item.id);
        pushed++;
      } catch (error) {
        console.error(`Error syncing outbox item ${item.id}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // Increment retry count
        await db.incrementOutboxRetries(item.id, errorMessage);
        errors.push(`Failed to sync ${item.table_name}:${item.row_id} - ${errorMessage}`);
      }
    }

    return { success: errors.length === 0, pushed, errors };
  } catch (error) {
    console.error('Error pushing outbox:', error);
    return { 
      success: false, 
      pushed: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
};

export const pullChanges = async (): Promise<PullResult> => {
  try {
    const auth = await getStoredAuth();
    if (!auth) {
      throw new Error('No authentication found');
    }

    // Set auth header
    supabase.auth.setSession({
      access_token: auth.access_token,
      refresh_token: auth.refresh_token,
    });

    const deviceId = await getDeviceId();
    let pulled = 0;
    const errors: string[] = [];

    // Get last sync time from device record
    const device = await db.findOne('devices', 'device_id = ?', [deviceId]);
    const lastSync = device?.updated_at || new Date(0).toISOString();

    // Define tables to sync
    const tables = ['vehicle_types', 'rate_plans', 'rate_items', 'tickets', 'payments', 'devices'];

    for (const table of tables) {
      try {
        // Get changes from server
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .gte('updated_at', lastSync)
          .neq('device_id', deviceId); // Don't pull our own changes

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          // Apply LWW policy - server wins on conflict
          for (const record of data) {
            try {
              // Check if record exists locally
              const existing = await db.findById(table, record.id);
              
              if (existing) {
                // Update existing record
                await db.update(table, record.id, record);
              } else {
                // Insert new record
                await db.insert(table, record);
              }
              
              pulled++;
            } catch (error) {
              console.error(`Error applying change for ${table}:${record.id}:`, error);
              errors.push(`Failed to apply ${table}:${record.id}`);
            }
          }
        }
      } catch (error) {
        console.error(`Error pulling changes for ${table}:`, error);
        errors.push(`Failed to pull ${table}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update device sync time
    if (device) {
      await db.update('devices', device.id, { updated_at: new Date().toISOString() });
    }

    return { success: errors.length === 0, pulled, errors };
  } catch (error) {
    console.error('Error pulling changes:', error);
    return { 
      success: false, 
      pulled: 0, 
      errors: [error instanceof Error ? error.message : 'Unknown error'] 
    };
  }
};

export const syncAll = async (): Promise<SyncResult> => {
  try {
    console.log('Starting sync...');
    
    // First push local changes
    const pushResult = await pushOutbox();
    
    // Then pull server changes
    const pullResult = await pullChanges();
    
    const result: SyncResult = {
      success: pushResult.success && pullResult.success,
      pushed: pushResult.pushed,
      pulled: pullResult.pulled,
      errors: [...pushResult.errors, ...pullResult.errors],
    };
    
    console.log('Sync completed:', result);
    return result;
  } catch (error) {
    console.error('Error during sync:', error);
    return {
      success: false,
      pushed: 0,
      pulled: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
};

export const checkConnection = async (): Promise<boolean> => {
  try {
    const auth = await getStoredAuth();
    if (!auth) {
      return false;
    }

    // Try to refresh auth first
    const refreshedAuth = await refreshAuth();
    if (!refreshedAuth) {
      return false;
    }

    // Test connection with a simple query
    supabase.auth.setSession({
      access_token: refreshedAuth.access_token,
      refresh_token: refreshedAuth.refresh_token,
    });

    const { error } = await supabase
      .from('devices')
      .select('id')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};
