import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { FormField } from '@/components/ui/FormField';
import { Colors } from '@/constants/theme';
import { useDeviceStore } from '@/store/deviceSlice';
import { useTicketsStore } from '@/store/ticketsSlice';
import { useVehicleTypesStore } from '@/store/vehicleTypesSlice';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function NewEntryScreen() {
  const { vehicleTypes, loadVehicleTypes } = useVehicleTypesStore();
  const { createTicket } = useTicketsStore();
  const { device } = useDeviceStore();
  
  const [selectedVehicleType, setSelectedVehicleType] = useState('');
  const [plate, setPlate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const handleCreateTicket = async () => {
    if (!selectedVehicleType) {
      Alert.alert('Error', 'Por favor selecciona un tipo de vehículo');
      return;
    }

    if (!plate.trim()) {
      Alert.alert('Error', 'Por favor ingresa la placa del vehículo');
      return;
    }

    setIsLoading(true);
    try {
      const ticketId = await createTicket({
        vehicle_type_id: selectedVehicleType,
        plate: plate.trim().toUpperCase(),
      });

      // Navegar directamente a la vista del ticket
      router.push(`/tickets/${ticketId}`);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al crear el ticket');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Nueva Entrada</Text>
          <Text style={styles.subtitle}>
            Registra la entrada de un vehículo al estacionamiento
          </Text>

          <View style={styles.form}>
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Tipo de Vehículo *</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedVehicleType}
                  onValueChange={setSelectedVehicleType}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecciona un tipo" value="" />
                  {vehicleTypes.map((type) => (
                    <Picker.Item
                      key={type.id}
                      label={type.name}
                      value={type.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <FormField
              label="Placa del Vehículo"
              value={plate}
              onChangeText={setPlate}
              placeholder="ABC-123"
              autoCapitalize="characters"
              required
            />


            <AppButton
              title="Crear Ticket"
              onPress={handleCreateTicket}
              loading={isLoading}
              disabled={!selectedVehicleType || !plate.trim()}
              style={styles.button}
            />
          </View>
        </AppCard>

        {device && (
          <AppCard style={styles.infoCard}>
            <Text style={styles.infoTitle}>Información del Dispositivo</Text>
            <Text style={styles.infoText}>
              <Text style={styles.infoLabel}>Ubicación:</Text> {device.location_name}
            </Text>
          </AppCard>
        )}
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
  },
  card: {
    marginBottom: 16,
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
  form: {
    gap: 16,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  button: {
    marginTop: 16,
  },
  infoCard: {
    paddingVertical: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  infoLabel: {
    fontWeight: '600',
  },
});
