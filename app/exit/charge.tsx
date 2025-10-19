import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { TicketPreview } from '@/components/ui/TicketPreview';
import { Colors } from '@/constants/theme';
import { formatCurrency, formatDateTime, formatDuration } from '@/services/pricing';
import { useRatesStore } from '@/store/ratesSlice';
import { useTicketsStore } from '@/store/ticketsSlice';
import { useVehicleTypesStore } from '@/store/vehicleTypesSlice';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ChargeExitScreen() {
  const { getTicketById, closeTicket, processPayment } = useTicketsStore();
  const { vehicleTypes } = useVehicleTypesStore();
  const { activeRatePlan, getRateItemForVehicleType } = useRatesStore();
  
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    if (ticketId) {
      const ticketData = getTicketById(ticketId);
      if (ticketData) {
        setTicket(ticketData);
      }
    }
  }, [ticketId]);

  const calculateTotal = () => {
    if (!ticket || !activeRatePlan) return 0;
    
    const rateItem = getRateItemForVehicleType(activeRatePlan.id, ticket.vehicle_type_id);
    if (!rateItem) return 0;

    const entryTime = new Date(ticket.entry_time);
    const exitTime = new Date();
    const durationMinutes = Math.floor((exitTime.getTime() - entryTime.getTime()) / (1000 * 60));
    
    const baseMinutes = rateItem.base_minutes;
    const basePrice = rateItem.base_price;
    const addMinutes = rateItem.add_minutes;
    const addPrice = rateItem.add_price;
    const dailyMax = activeRatePlan.daily_max;
    
    let total = basePrice;
    
    if (durationMinutes > baseMinutes) {
      const additionalMinutes = durationMinutes - baseMinutes;
      const additionalBlocks = Math.ceil(additionalMinutes / addMinutes);
      total += additionalBlocks * addPrice;
    }
    
    if (dailyMax && total > dailyMax) {
      total = dailyMax;
    }
    
    return total;
  };

  const handleConfirmExit = () => {
    Alert.alert(
      'Confirmar Salida',
      '¿Estás seguro de que deseas procesar la salida de este vehículo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => setShowPayment(true),
        },
      ]
    );
  };

  const handleProcessPayment = async () => {
    if (!ticket) return;

    const total = calculateTotal();
    
    setIsLoading(true);
    try {
      // Close ticket
      await closeTicket(ticket.id, new Date().toISOString(), durationMinutes, total);

      // Process payment (cash only for now)
      await processPayment({
        ticket_id: ticket.id,
        method: 'cash',
        amount: total,
        change: 0,
      });

      Alert.alert(
        '¡Salida Procesada!',
        `Total cobrado: ${formatCurrency(total)}`,
        [
          {
            text: 'Imprimir Ticket',
            onPress: () => {
              // TODO: Implement print functionality
              router.back();
            },
          },
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al procesar la salida');
    } finally {
      setIsLoading(false);
    }
  };

  if (!ticket) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ticket no encontrado</Text>
          <AppButton
            title="Volver"
            onPress={() => router.back()}
            style={styles.button}
          />
        </View>
      </View>
    );
  }

  const vehicleType = vehicleTypes.find(vt => vt.id === ticket.vehicle_type_id);
  const total = calculateTotal();
  const entryTime = new Date(ticket.entry_time);
  const exitTime = new Date();
  const durationMinutes = Math.floor((exitTime.getTime() - entryTime.getTime()) / (1000 * 60));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AppCard style={styles.ticketPreview}>
          <TicketPreview
            ticket={ticket}
            vehicleType={vehicleType!}
            ratePlan={activeRatePlan!}
            isExit={showPayment}
          />
        </AppCard>

        {!showPayment ? (
          <AppCard style={styles.confirmCard}>
            <Text style={styles.sectionTitle}>Confirmar Salida</Text>
            <Text style={styles.confirmText}>
              ¿Deseas procesar la salida de este vehículo?
            </Text>
            <AppButton
              title="Confirmar Salida"
              onPress={handleConfirmExit}
              style={styles.confirmButton}
            />
          </AppCard>
        ) : (
          <AppCard style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>Resumen de Cobro</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Placa:</Text>
              <Text style={styles.detailValue}>{ticket.plate}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tipo:</Text>
              <Text style={styles.detailValue}>{vehicleType?.name}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Entrada:</Text>
              <Text style={styles.detailValue}>{formatDateTime(entryTime)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Salida:</Text>
              <Text style={styles.detailValue}>{formatDateTime(exitTime)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duración:</Text>
              <Text style={styles.detailValue}>{formatDuration(durationMinutes)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a Cobrar:</Text>
              <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
            </View>
            
            <AppButton
              title="Procesar Pago"
              onPress={handleProcessPayment}
              loading={isLoading}
              style={styles.paymentButton}
            />
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
    gap: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 24,
  },
  button: {
    minWidth: 200,
  },
  ticketPreview: {
    padding: 16,
  },
  confirmCard: {
    padding: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  confirmText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmButton: {
    minWidth: 200,
  },
  paymentCard: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailLabel: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Colors.light.text,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: Colors.light.primary,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  paymentButton: {
    marginTop: 16,
  },
});