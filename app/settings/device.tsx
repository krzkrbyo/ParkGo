import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { FormField } from '@/components/ui/FormField';
import { Colors } from '@/constants/theme';
import { useDeviceStore } from '@/store/deviceSlice';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function DeviceSettingsScreen() {
  const { 
    device, 
    loadDevice, 
    updateDevice, 
    updateScannerMode, 
    updatePrinterSettings,
    isLoading 
  } = useDeviceStore();
  
  const [businessName, setBusinessName] = useState('');
  const [ticketHeader, setTicketHeader] = useState('');
  const [locationName, setLocationName] = useState('');
  const [printerName, setPrinterName] = useState('');
  const [printerAddress, setPrinterAddress] = useState('');
  const [scannerMode, setScannerMode] = useState<'HID' | 'CAMERA'>('HID');

  useEffect(() => {
    loadDevice();
  }, []);

  useEffect(() => {
    if (device) {
      setBusinessName(device.business_name);
      setTicketHeader(device.ticket_header);
      setLocationName(device.location_name);
      setPrinterName(device.printer_name || '');
      setPrinterAddress(device.printer_address || '');
      setScannerMode(device.scanner_mode);
    }
  }, [device]);

  const handleSave = async () => {
    if (!businessName.trim() || !ticketHeader.trim() || !locationName.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos');
      return;
    }

    try {
      await updateDevice({
        business_name: businessName.trim(),
        ticket_header: ticketHeader.trim(),
        location_name: locationName.trim(),
        printer_name: printerName.trim() || null,
        printer_address: printerAddress.trim() || null,
        scanner_mode: scannerMode,
      });
      Alert.alert('Éxito', 'Configuración guardada');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al guardar configuración');
    }
  };

  const handleScannerModeChange = async (mode: 'HID' | 'CAMERA') => {
    setScannerMode(mode);
    try {
      await updateScannerMode(mode);
    } catch (error) {
      Alert.alert('Error', 'Error al cambiar modo de escaneo');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando configuración...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Configuración del Dispositivo</Text>
          <Text style={styles.subtitle}>
            Configura la información de tu estacionamiento
          </Text>

          <View style={styles.form}>
            <FormField
              label="Nombre del Negocio"
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Mi Estacionamiento"
              required
            />

            <FormField
              label="Encabezado del Ticket"
              value={ticketHeader}
              onChangeText={setTicketHeader}
              placeholder="ESTACIONAMIENTO\nMi Negocio"
              multiline
              numberOfLines={3}
              required
            />

            <FormField
              label="Ubicación"
              value={locationName}
              onChangeText={setLocationName}
              placeholder="Centro Comercial, Piso 2"
              required
            />
          </View>
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Configuración de Impresión</Text>
          
          <FormField
            label="Nombre de la Impresora"
            value={printerName}
            onChangeText={setPrinterName}
            placeholder="Impresora Térmica"
          />

          <FormField
            label="Dirección de la Impresora"
            value={printerAddress}
            onChangeText={setPrinterAddress}
            placeholder="192.168.1.100:9100"
          />
        </AppCard>

        <AppCard style={styles.card}>
          <Text style={styles.sectionTitle}>Modo de Escaneo</Text>
          
          <View style={styles.scannerOptions}>
            <AppButton
              title="HID (Lector de Anillo)"
              onPress={() => handleScannerModeChange('HID')}
              variant={scannerMode === 'HID' ? 'primary' : 'outline'}
              style={styles.scannerButton}
            />
            
            <AppButton
              title="Cámara"
              onPress={() => handleScannerModeChange('CAMERA')}
              variant={scannerMode === 'CAMERA' ? 'primary' : 'outline'}
              style={styles.scannerButton}
            />
          </View>
          
          <Text style={styles.scannerDescription}>
            {scannerMode === 'HID' 
              ? 'Usa un lector de códigos de barras que se conecta como teclado'
              : 'Usa la cámara del dispositivo para escanear códigos QR y de barras'
            }
          </Text>
        </AppCard>

        <AppButton
          title="Guardar Configuración"
          onPress={handleSave}
          style={styles.saveButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  card: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  form: {
    gap: 16,
  },
  scannerOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  scannerButton: {
    flex: 1,
  },
  scannerDescription: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
    lineHeight: 16,
  },
  saveButton: {
    marginTop: 16,
  },
});
