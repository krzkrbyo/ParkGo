import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import { formatBarcodeData, isCameraAvailable, requestCameraPermission, validateBarcode } from '@/services/scanner';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function ScanModal() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera');

  useEffect(() => {
    getCameraPermission();
  }, []);

  const getCameraPermission = async () => {
    const permission = await requestCameraPermission();
    setHasPermission(permission);
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    if (!validateBarcode(data, type)) {
      Alert.alert('Error', 'Código de barras no válido');
      return;
    }

    const formattedData = formatBarcodeData(data);
    
    Alert.alert(
      'Código Escaneado',
      `Tipo: ${type}\nDatos: ${formattedData}`,
      [
        {
          text: 'Cancelar',
          onPress: () => setScanned(false),
        },
        {
          text: 'Usar',
          onPress: () => {
            // Pass the scanned data back to the previous screen
            router.back();
            // TODO: Implement callback to pass data back
          },
        },
      ]
    );
  };

  const handleManualEntry = () => {
    setScannerMode('manual');
  };

  const handleBackToCamera = () => {
    setScannerMode('camera');
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Solicitando Permisos</Text>
          <Text style={styles.subtitle}>Por favor espera...</Text>
        </AppCard>
      </View>
    );
  }

  if (hasPermission === false || !isCameraAvailable()) {
    return (
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Escáner No Disponible</Text>
          <Text style={styles.subtitle}>
            El escáner de códigos de barras no está disponible en este momento.
            Puedes ingresar el código manualmente.
          </Text>
          <AppButton
            title="Entrada Manual"
            onPress={handleManualEntry}
            style={styles.button}
          />
          <AppButton
            title="Volver"
            onPress={() => router.back()}
            variant="outline"
            style={styles.button}
          />
        </AppCard>
      </View>
    );
  }

  if (scannerMode === 'manual') {
    return (
      <View style={styles.container}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Entrada Manual</Text>
          <Text style={styles.subtitle}>
            Ingresa el código de barras manualmente
          </Text>
          <AppButton
            title="Volver a la Cámara"
            onPress={handleBackToCamera}
            variant="outline"
            style={styles.button}
          />
        </AppCard>
      </View>
    );
  }

  // If we reach here, camera is not available, show manual entry
  return (
    <View style={styles.container}>
      <AppCard style={styles.card}>
        <Text style={styles.title}>Entrada Manual</Text>
        <Text style={styles.subtitle}>
          Ingresa el código de barras manualmente
        </Text>
        <AppButton
          title="Volver"
          onPress={() => router.back()}
          variant="outline"
          style={styles.button}
        />
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  card: {
    margin: 24,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  button: {
    marginBottom: 12,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: Colors.light.primary,
    backgroundColor: 'transparent',
    borderRadius: 8,
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    top: 100,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
