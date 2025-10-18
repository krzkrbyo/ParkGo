import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { FormField } from '@/components/ui/FormField';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    setIsLoading(true);
    try {
      const { signInWithPassword } = await import('@/services/auth');
      const user = await signInWithPassword(email.trim(), password.trim());
      
      // Update auth store
      const { useAuthStore } = await import('@/store/authSlice');
      useAuthStore.getState().setUser(user);
      
      Alert.alert('¡Bienvenido!', 'Has iniciado sesión correctamente', [
        {
          text: 'Continuar',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    try {
      const { signUpWithPassword } = await import('@/services/auth');
      await signUpWithPassword(email.trim(), password.trim());
      Alert.alert(
        '¡Registro exitoso!', 
        'Tu cuenta ha sido creada. Revisa tu email para confirmar tu cuenta antes de iniciar sesión.',
        [
          {
            text: 'OK',
            onPress: () => setAuthMode('signin'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>ParkGo</Text>
            <Text style={styles.subtitle}>Sistema de Estacionamiento</Text>
          </View>

          <AppCard style={styles.card}>
            <View style={styles.modeSelector}>
              <AppButton
                title="Iniciar Sesión"
                onPress={() => setAuthMode('signin')}
                variant={authMode === 'signin' ? 'primary' : 'outline'}
                size="small"
                style={styles.modeButton}
              />
              <AppButton
                title="Registrarse"
                onPress={() => setAuthMode('signup')}
                variant={authMode === 'signup' ? 'primary' : 'outline'}
                size="small"
                style={styles.modeButton}
              />
            </View>

            <Text style={styles.cardTitle}>
              {authMode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </Text>
            
            <Text style={styles.cardDescription}>
              {authMode === 'signin' ? 'Ingresa tus credenciales para acceder' : 'Crea una nueva cuenta'}
            </Text>

            <FormField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              required
            />

            <FormField
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
              required
            />

            <AppButton
              title={authMode === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              onPress={authMode === 'signin' ? handleSignIn : handleSignUp}
              loading={isLoading}
              disabled={!email.trim() || !password.trim()}
              style={styles.button}
            />
          </AppCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros términos de servicio
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
  },
  card: {
    marginBottom: 24,
  },
  modeSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  modeButton: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: 'center',
    opacity: 0.7,
  },
});
