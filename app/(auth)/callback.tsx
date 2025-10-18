import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import { useAuthStore } from '@/store/authSlice';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function AuthCallbackScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setSession } = useAuthStore();

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      setIsLoading(true);
      
      // Get the URL from the deep link
      const url = await Linking.getInitialURL();
      
      if (!url) {
        setError('No se pudo obtener la URL de autenticación');
        return;
      }

      // Parse the URL to extract the access token and refresh token
      const parsed = Linking.parse(url);
      
      if (parsed.queryParams?.error) {
        setError(`Error de autenticación: ${parsed.queryParams.error_description || parsed.queryParams.error}`);
        return;
      }

      if (parsed.queryParams?.access_token && parsed.queryParams?.refresh_token) {
        // Store the session securely
        const { AUTH_KEYS } = await import('@/services/auth');
        const { SecureStore } = await import('expo-secure-store');
        
        await Promise.all([
          SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, parsed.queryParams.access_token as string),
          SecureStore.setItemAsync(AUTH_KEYS.REFRESH_TOKEN, parsed.queryParams.refresh_token as string),
        ]);
        
        // Get user info from Supabase
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.EXPO_PUBLIC_SUPABASE_URL!,
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser(parsed.queryParams.access_token as string);
        
        if (userError || !user) {
          setError('Error al obtener información del usuario');
          return;
        }

        // Store user info
        await Promise.all([
          SecureStore.setItemAsync(AUTH_KEYS.USER_EMAIL, user.email!),
          SecureStore.setItemAsync(AUTH_KEYS.USER_ID, user.id),
        ]);

        setUser({
          id: user.id,
          email: user.email!,
          created_at: user.created_at,
        });

        Alert.alert('¡Éxito!', 'Tu cuenta ha sido confirmada correctamente', [
          {
            text: 'Continuar',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        setError('Token de autenticación no encontrado');
      }
    } catch (error) {
      console.error('Error handling auth callback:', error);
      setError('Error inesperado durante la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    handleAuthCallback();
  };

  const handleGoToSignIn = () => {
    router.replace('/(auth)/sign-in');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Procesando autenticación...</Text>
          <Text style={styles.subtitle}>
            Por favor espera mientras verificamos tu cuenta
          </Text>
        </AppCard>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Error de Autenticación</Text>
          <Text style={styles.subtitle}>{error}</Text>
          
          <AppButton
            title="Reintentar"
            onPress={handleRetry}
            style={styles.button}
          />
          
          <AppButton
            title="Volver al Inicio"
            onPress={handleGoToSignIn}
            variant="outline"
            style={styles.button}
          />
        </AppCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppCard style={styles.card}>
        <Text style={styles.title}>¡Autenticación Exitosa!</Text>
        <Text style={styles.subtitle}>
          Redirigiendo al dashboard...
        </Text>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 12,
    minWidth: 200,
  },
});
