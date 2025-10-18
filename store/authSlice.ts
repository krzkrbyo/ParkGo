import { create } from 'zustand';
import { clearAuth, getStoredAuth, refreshAuth } from '../services/auth';
import { AuthUser } from '../types/models';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadStoredAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user,
    error: null 
  }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  loadStoredAuth: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const user = await getStoredAuth();
      if (user) {
        // Try to refresh the token
        const refreshedUser = await refreshAuth();
        set({ 
          user: refreshedUser || user, 
          isAuthenticated: true,
          isLoading: false 
        });
      } else {
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load authentication',
        isLoading: false 
      });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    
    try {
      await clearAuth();
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false,
        error: null 
      });
    } catch (error) {
      console.error('Error signing out:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out',
        isLoading: false 
      });
    }
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const refreshedUser = await refreshAuth();
      if (refreshedUser) {
        set({ user: refreshedUser });
      } else {
        // Token refresh failed, sign out
        await get().signOut();
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      await get().signOut();
    }
  },

  clearError: () => set({ error: null }),
}));
