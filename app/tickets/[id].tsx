import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { TicketPreview } from '@/components/ui/TicketPreview';
import { Colors } from '@/constants/theme';
import { formatCurrency, formatDateTime, formatDuration } from '@/services/pricing';
import { useRatesStore } from '@/store/ratesSlice';
import { useTicketsStore } from '@/store/ticketsSlice';
import { useVehicleTypesStore } from '@/store/vehicleTypesSlice';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getTicketById, getPaymentsForTicket } = useTicketsStore();
  const { vehicleTypes } = useVehicleTypesStore();
  const { ratePlans } = useRatesStore();
  
  const [ticket, setTicket] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      const ticketData = getTicketById(id);
      if (ticketData) {
        setTicket(ticketData);
        const ticketPayments = getPaymentsForTicket(id);
        setPayments(ticketPayments);
      }
    }
  }, [id]);

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
  const ratePlan = ratePlans.find(rp => rp.id === ticket.rate_plan_id);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AppCard style={styles.ticketPreview}>
          <TicketPreview
            ticket={ticket}
            vehicleType={vehicleType!}
            ratePlan={ratePlan!}
            isExit={ticket.status === 'closed'}
          />
        </AppCard>

        <AppCard style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Detalles del Ticket</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>ID:</Text>
            <Text style={styles.detailValue}>{ticket.id}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Estado:</Text>
            <StatusPill 
              status={ticket.status} 
              text={ticket.status === 'open' ? 'Abierto' : 'Cerrado'} 
            />
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Placa:</Text>
            <Text style={styles.detailValue}>{ticket.plate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Tipo de Vehículo:</Text>
            <Text style={styles.detailValue}>{vehicleType?.name}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Entrada:</Text>
            <Text style={styles.detailValue}>{formatDateTime(ticket.entry_time)}</Text>
          </View>
          
          {ticket.exit_time && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Salida:</Text>
              <Text style={styles.detailValue}>{formatDateTime(ticket.exit_time)}</Text>
            </View>
          )}
          
          {ticket.duration_minutes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duración:</Text>
              <Text style={styles.detailValue}>{formatDuration(ticket.duration_minutes)}</Text>
            </View>
          )}
          
          {ticket.total && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total:</Text>
              <Text style={[styles.detailValue, styles.totalValue]}>
                {formatCurrency(ticket.total)}
              </Text>
            </View>
          )}
        </AppCard>

        {payments.length > 0 && (
          <AppCard style={styles.paymentsCard}>
            <Text style={styles.sectionTitle}>Pagos</Text>
            {payments.map((payment, index) => (
              <View key={payment.id} style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Pago #{index + 1}</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text style={styles.paymentMethod}>
                    {payment.method === 'cash' ? 'Efectivo' : payment.method}
                  </Text>
                  {payment.change > 0 && (
                    <Text style={styles.paymentChange}>
                      Cambio: {formatCurrency(payment.change)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </AppCard>
        )}

        <View style={styles.actions}>
          <AppButton
            title="Volver"
            onPress={() => router.back()}
            variant="outline"
            style={styles.actionButton}
          />
          
          {ticket.status === 'open' && (
            <AppButton
              title="Cobrar Salida"
              onPress={() => router.push('/exit/charge')}
              style={styles.actionButton}
            />
          )}
        </View>
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
  detailsCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.light.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  paymentsCard: {
    padding: 16,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  paymentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  paymentDetails: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  paymentMethod: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  paymentChange: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
