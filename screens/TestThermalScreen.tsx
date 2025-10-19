import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrinterDevice, thermalPrinterService } from '../ble/ThermalPrinterService';
import { Colors } from '../constants/theme';

export default function TestThermalScreen() {
  const [devices, setDevices] = useState<PrinterDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<PrinterDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  
  // QR Configuration
  const [qrValue, setQrValue] = useState('https://example.com/ticket/12345');
  const [moduleSize, setModuleSize] = useState(6);
  const [ecl, setEcl] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  
  // Ticket data
  const [ticketId, setTicketId] = useState('TKT-12345');
  const [plate, setPlate] = useState('ABC-123');
  const [businessName, setBusinessName] = useState('ParkGo Estacionamiento');
  const [location, setLocation] = useState('Centro Comercial Plaza');

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isConnected) {
        thermalPrinterService.disconnect();
      }
    };
  }, [isConnected]);

  const handleScanDevices = async () => {
    setIsScanning(true);
    try {
      const foundDevices = await thermalPrinterService.scanForDevices(10000);
      setDevices(foundDevices);
      if (foundDevices.length === 0) {
        Alert.alert('No se encontraron dispositivos', 'No se encontraron impresoras térmicas en el área');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al escanear dispositivos: ' + (error as Error).message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnectDevice = async (device: PrinterDevice) => {
    setIsConnecting(true);
    try {
      const success = await thermalPrinterService.connectToDevice(device.id);
      if (success) {
        setSelectedDevice(device);
        setIsConnected(true);
        Alert.alert('Conectado', `Conectado a ${device.name}`);
      } else {
        Alert.alert('Error', 'No se pudo conectar al dispositivo');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al conectar: ' + (error as Error).message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await thermalPrinterService.disconnect();
      setSelectedDevice(null);
      setIsConnected(false);
      Alert.alert('Desconectado', 'Dispositivo desconectado');
    } catch (error) {
      Alert.alert('Error', 'Error al desconectar: ' + (error as Error).message);
    }
  };

  const handleTestPrint = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'No hay dispositivo conectado');
      return;
    }

    setIsPrinting(true);
    try {
      const result = await thermalPrinterService.testPrint();
      if (result.success) {
        Alert.alert('Éxito', 'Impresión de prueba enviada');
      } else {
        Alert.alert('Error', result.error || 'Error desconocido');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al imprimir: ' + (error as Error).message);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintQR = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'No hay dispositivo conectado');
      return;
    }

    setIsPrinting(true);
    try {
      const result = await thermalPrinterService.printQR({
        value: qrValue,
        moduleSize,
        ecl,
        align: 'center',
        feedAfter: 4,
      });
      
      if (result.success) {
        Alert.alert('Éxito', 'QR Code impreso correctamente');
      } else {
        Alert.alert('Error', result.error || 'Error desconocido');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al imprimir QR: ' + (error as Error).message);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintTicket = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'No hay dispositivo conectado');
      return;
    }

    setIsPrinting(true);
    try {
      const result = await thermalPrinterService.printTicket({
        id: ticketId,
        plate,
        entryTime: new Date().toLocaleString(),
        businessName,
        location,
      }, {
        value: qrValue,
        moduleSize,
        ecl,
      });
      
      if (result.success) {
        Alert.alert('Éxito', 'Ticket impreso correctamente');
      } else {
        Alert.alert('Error', result.error || 'Error desconocido');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al imprimir ticket: ' + (error as Error).message);
    } finally {
      setIsPrinting(false);
    }
  };

  const renderDevice = ({ item }: { item: PrinterDevice }) => (
    <TouchableOpacity
      style={[
        styles.deviceItem,
        selectedDevice?.id === item.id && styles.selectedDevice
      ]}
      onPress={() => setSelectedDevice(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        <Text style={styles.deviceRssi}>Señal: {item.rssi} dBm</Text>
      </View>
      <TouchableOpacity
        style={styles.connectButton}
        onPress={() => handleConnectDevice(item)}
        disabled={isConnecting}
      >
        <Text style={styles.connectButtonText}>
          {isConnecting ? 'Conectando...' : 'Conectar'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Prueba Impresora Térmica</Text>
          <Text style={styles.subtitle}>
            Escanea, conecta y prueba la impresión Bluetooth
          </Text>
        </View>

        {/* Device Scanning */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dispositivos Bluetooth</Text>
          
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScanDevices}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.scanButtonText}>Escanear Dispositivos</Text>
            )}
          </TouchableOpacity>

          {devices.length > 0 && (
            <FlatList
              data={devices}
              renderItem={renderDevice}
              keyExtractor={(item) => item.id}
              style={styles.deviceList}
            />
          )}

          {isConnected && selectedDevice && (
            <View style={styles.connectedInfo}>
              <Text style={styles.connectedText}>
                Conectado a: {selectedDevice.name}
              </Text>
              <TouchableOpacity
                style={styles.disconnectButton}
                onPress={handleDisconnect}
              >
                <Text style={styles.disconnectButtonText}>Desconectar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* QR Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuración QR</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Valor del QR:</Text>
            <TextInput
              style={styles.input}
              value={qrValue}
              onChangeText={setQrValue}
              placeholder="Ingresa el valor del QR"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tamaño del módulo: {moduleSize}</Text>
            <View style={styles.sliderContainer}>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setModuleSize(Math.max(1, moduleSize - 1))}
              >
                <Text style={styles.sliderButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.sliderValue}>{moduleSize}</Text>
              <TouchableOpacity
                style={styles.sliderButton}
                onPress={() => setModuleSize(Math.min(16, moduleSize + 1))}
              >
                <Text style={styles.sliderButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nivel de corrección de errores:</Text>
            <View style={styles.eclContainer}>
              {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.eclButton,
                    ecl === level && styles.eclButtonSelected
                  ]}
                  onPress={() => setEcl(level)}
                >
                  <Text style={[
                    styles.eclButtonText,
                    ecl === level && styles.eclButtonTextSelected
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Ticket Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Ticket</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID del Ticket:</Text>
            <TextInput
              style={styles.input}
              value={ticketId}
              onChangeText={setTicketId}
              placeholder="ID del ticket"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Placa:</Text>
            <TextInput
              style={styles.input}
              value={plate}
              onChangeText={setPlate}
              placeholder="Placa del vehículo"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Negocio:</Text>
            <TextInput
              style={styles.input}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Nombre del negocio"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación:</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Ubicación"
            />
          </View>
        </View>

        {/* Print Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones de Impresión</Text>
          
          <TouchableOpacity
            style={[styles.actionButton, !isConnected && styles.actionButtonDisabled]}
            onPress={handleTestPrint}
            disabled={!isConnected || isPrinting}
          >
            <Text style={styles.actionButtonText}>
              {isPrinting ? 'Imprimiendo...' : 'Impresión de Prueba'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !isConnected && styles.actionButtonDisabled]}
            onPress={handlePrintQR}
            disabled={!isConnected || isPrinting}
          >
            <Text style={styles.actionButtonText}>
              {isPrinting ? 'Imprimiendo...' : 'Imprimir QR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, !isConnected && styles.actionButtonDisabled]}
            onPress={handlePrintTicket}
            disabled={!isConnected || isPrinting}
          >
            <Text style={styles.actionButtonText}>
              {isPrinting ? 'Imprimiendo...' : 'Imprimir Ticket Completo'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deviceList: {
    maxHeight: 200,
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedDevice: {
    borderColor: Colors.light.primary,
    backgroundColor: '#f0f8ff',
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  deviceId: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: Colors.light.text,
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: Colors.light.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  connectedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    marginTop: 8,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  disconnectButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButton: {
    width: 40,
    height: 40,
    backgroundColor: Colors.light.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginHorizontal: 20,
    minWidth: 60,
    textAlign: 'center',
  },
  eclContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  eclButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  eclButtonSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  eclButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  eclButtonTextSelected: {
    color: 'white',
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
