import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { AuthUser } from '../types/models';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const AUTH_KEYS = {
  ACCESS_TOKEN: 'parkgo_access_token',
  REFRESH_TOKEN: 'parkgo_refresh_token',
  USER_EMAIL: 'parkgo_user_email',
  USER_ID: 'parkgo_user_id',
};

export const signUpWithPassword = async (email: string, password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.EXPO_PUBLIC_DEEP_LINK_SCHEME || 'parkgo'}://auth/callback`,
        data: {
          email_confirm: true,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signInWithPassword = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No se pudo obtener información del usuario');
    }

    // Store session
    if (data.session) {
      await Promise.all([
        SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, data.session.access_token),
        SecureStore.setItemAsync(AUTH_KEYS.REFRESH_TOKEN, data.session.refresh_token),
        SecureStore.setItemAsync(AUTH_KEYS.USER_EMAIL, data.user.email!),
        SecureStore.setItemAsync(AUTH_KEYS.USER_ID, data.user.id),
      ]);
    }

    return {
      id: data.user.id,
      email: data.user.email!,
      created_at: data.user.created_at,
    };
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};



export const getStoredAuth = async (): Promise<AuthUser | null> => {
  try {
    const [accessToken, refreshToken, email, userId] = await Promise.all([
      SecureStore.getItemAsync(AUTH_KEYS.ACCESS_TOKEN),
      SecureStore.getItemAsync(AUTH_KEYS.REFRESH_TOKEN),
      SecureStore.getItemAsync(AUTH_KEYS.USER_EMAIL),
      SecureStore.getItemAsync(AUTH_KEYS.USER_ID),
    ]);

    if (!accessToken || !refreshToken || !email || !userId) {
      return null;
    }

    return {
      id: userId,
      email,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  } catch (error) {
    console.error('Error getting stored auth:', error);
    return null;
  }
};

export const refreshAuth = async (): Promise<AuthUser | null> => {
  try {
    const storedAuth = await getStoredAuth();
    if (!storedAuth) {
      return null;
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: storedAuth.refresh_token,
    });

    if (error) {
      console.error('Error refreshing auth:', error);
      await clearAuth();
      return null;
    }

    if (!data.user || !data.session) {
      await clearAuth();
      return null;
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email!,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };

    // Update stored auth data
    await Promise.all([
      SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, authUser.access_token),
      SecureStore.setItemAsync(AUTH_KEYS.REFRESH_TOKEN, authUser.refresh_token),
    ]);

    return authUser;
  } catch (error) {
    console.error('Error refreshing auth:', error);
    await clearAuth();
    return null;
  }
};

export const clearAuth = async (): Promise<void> => {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(AUTH_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(AUTH_KEYS.USER_EMAIL),
      SecureStore.deleteItemAsync(AUTH_KEYS.USER_ID),
    ]);
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await supabase.auth.signOut();
    await clearAuth();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};
