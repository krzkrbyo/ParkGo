import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TestPrintScreen() {
  const handleTestStandardPrint = () => {
    router.push('/screens/TestPrintScreen');
  };

  const handleTestThermalPrint = () => {
    router.push('/screens/TestThermalScreen');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Pruebas de Impresión</Text>
          <Text style={styles.subtitle}>
            Selecciona el tipo de impresión que deseas probar
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          <AppCard style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Impresión Estándar</Text>
              <Text style={styles.cardDescription}>
                Prueba la impresión con expo-print y generación de PDF.
                Compatible con Expo Go.
              </Text>
              <Text style={styles.cardFeatures}>
                • QR codes de alta calidad{'\n'}
                • Control de tamaño físico{'\n'}
                • Generación de PDF{'\n'}
                • Quiet zone configurable
              </Text>
              <AppButton
                title="Probar Impresión Estándar"
                onPress={handleTestStandardPrint}
                style={styles.button}
              />
            </View>
          </AppCard>

          <AppCard style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Impresión Térmica Bluetooth</Text>
              <Text style={styles.cardDescription}>
                Prueba la impresión directa a impresoras térmicas via Bluetooth.
                Requiere Development Build.
              </Text>
              <Text style={styles.cardFeatures}>
                • Comandos ESC/POS nativos{'\n'}
                • Conexión Bluetooth{'\n'}
                • QR codes optimizados{'\n'}
                • Compatible con SAT AF330
              </Text>
              <AppButton
                title="Probar Impresión Térmica"
                onPress={handleTestThermalPrint}
                style={styles.button}
              />
            </View>
          </AppCard>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Información Importante</Text>
          <Text style={styles.infoText}>
            • La impresión estándar funciona con Expo Go{'\n'}
            • La impresión térmica requiere Development Build{'\n'}
            • Asegúrate de tener permisos de Bluetooth habilitados{'\n'}
            • Para impresión térmica, configura tu impresora en modo pareable
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    opacity: 0.8,
  },
  cardsContainer: {
    gap: 20,
    marginBottom: 32,
  },
  card: {
    padding: 20,
  },
  cardContent: {
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  cardDescription: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  cardFeatures: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.8,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
  infoSection: {
    backgroundColor: Colors.light.background,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    opacity: 0.8,
  },
});
