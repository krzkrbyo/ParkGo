import { create } from 'zustand';
import { checkConnection, syncAll } from '../services/sync';

interface SyncState {
  isOnline: boolean;
  lastSync: string | null;
  syncInProgress: boolean;
  error: string | null;
}

interface SyncActions {
  setIsOnline: (online: boolean) => void;
  setLastSync: (lastSync: string | null) => void;
  setSyncInProgress: (inProgress: boolean) => void;
  setError: (error: string | null) => void;
  checkConnection: () => Promise<void>;
  sync: () => Promise<void>;
  clearError: () => void;
}

type SyncStore = SyncState & SyncActions;

export const useSyncStore = create<SyncStore>((set, get) => ({
  // State
  isOnline: false,
  lastSync: null,
  syncInProgress: false,
  error: null,

  // Actions
  setIsOnline: (isOnline) => set({ isOnline, error: null }),

  setLastSync: (lastSync) => set({ lastSync, error: null }),

  setSyncInProgress: (syncInProgress) => set({ syncInProgress, error: null }),

  setError: (error) => set({ error, syncInProgress: false }),

  checkConnection: async () => {
    try {
      const isOnline = await checkConnection();
      set({ isOnline, error: null });
    } catch (error) {
      console.error('Error checking connection:', error);
      set({ 
        isOnline: false,
        error: error instanceof Error ? error.message : 'Failed to check connection'
      });
    }
  },

  sync: async () => {
    set({ syncInProgress: true, error: null });
    
    try {
      const result = await syncAll();
      
      if (result.success) {
        set({ 
          lastSync: new Date().toISOString(),
          syncInProgress: false,
          error: null 
        });
      } else {
        set({ 
          syncInProgress: false,
          error: result.errors.join(', ') 
        });
      }
    } catch (error) {
      console.error('Error during sync:', error);
      set({ 
        syncInProgress: false,
        error: error instanceof Error ? error.message : 'Failed to sync'
      });
    }
  },

  clearError: () => set({ error: null }),
}));
