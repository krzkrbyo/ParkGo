import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { FormField } from '@/components/ui/FormField';
import { Keypad } from '@/components/ui/Keypad';
import { TicketPreview } from '@/components/ui/TicketPreview';
import { Colors } from '@/constants/theme';
import { formatCurrency } from '@/services/pricing';
import { useDeviceStore } from '@/store/deviceSlice';
import { useRatesStore } from '@/store/ratesSlice';
import { useTicketsStore } from '@/store/ticketsSlice';
import { useVehicleTypesStore } from '@/store/vehicleTypesSlice';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ChargeExitScreen() {
  const { openTickets, closeTicket, processPayment } = useTicketsStore();
  const { vehicleTypes } = useVehicleTypesStore();
  const { activeRatePlan, getRateItemForVehicleType } = useRatesStore();
  const { device } = useDeviceStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredTickets = openTickets.filter(ticket =>
    ticket.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ticket.barcode && ticket.barcode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setPaymentAmount('');
  };

  const handleCloseTicket = async () => {
    if (!selectedTicket) return;

    setIsLoading(true);
    try {
      await closeTicket(selectedTicket.id, new Date().toISOString());
      setSelectedTicket(null);
      setSearchQuery('');
      Alert.alert('¡Ticket Cerrado!', 'El ticket ha sido cerrado exitosamente');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al cerrar el ticket');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    if (!selectedTicket || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount < (selectedTicket.total || 0)) {
      Alert.alert('Error', 'El monto debe ser mayor o igual al total del ticket');
      return;
    }

    setIsLoading(true);
    try {
      await processPayment({
        ticket_id: selectedTicket.id,
        method: 'cash',
        amount: amount,
        change: amount - (selectedTicket.total || 0),
      });

      Alert.alert(
        '¡Pago Procesado!',
        `Cambio: ${formatCurrency(amount - (selectedTicket.total || 0))}`,
        [
          {
            text: 'Imprimir',
            onPress: () => {
              // TODO: Implement print functionality
              setSelectedTicket(null);
              setSearchQuery('');
            },
          },
          {
            text: 'OK',
            onPress: () => {
              setSelectedTicket(null);
              setSearchQuery('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'C') {
      setPaymentAmount('');
    } else if (key === '⌫') {
      setPaymentAmount(prev => prev.slice(0, -1));
    } else {
      setPaymentAmount(prev => prev + key);
    }
  };

  const getVehicleType = (ticket: any) => {
    return vehicleTypes.find(vt => vt.id === ticket.vehicle_type_id);
  };

  const getRateItem = (ticket: any) => {
    if (!activeRatePlan) return null;
    return getRateItemForVehicleType(activeRatePlan.id, ticket.vehicle_type_id);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AppCard style={styles.card}>
          <Text style={styles.title}>Cobrar Salida</Text>
          <Text style={styles.subtitle}>
            Busca y procesa el pago de un ticket
          </Text>

          <FormField
            label="Buscar Ticket"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Placa, ID o código de barras"
            autoCapitalize="characters"
          />

          {filteredTickets.length > 0 && (
            <View style={styles.ticketsList}>
              {filteredTickets.map((ticket) => {
                const vehicleType = getVehicleType(ticket);
                const rateItem = getRateItem(ticket);
                
                return (
                  <AppCard
                    key={ticket.id}
                    style={[
                      styles.ticketCard,
                      selectedTicket?.id === ticket.id && styles.selectedTicketCard
                    ]}
                    onPress={() => handleSelectTicket(ticket)}
                  >
                    <View style={styles.ticketHeader}>
                      <Text style={styles.ticketId}>#{ticket.id.substring(0, 8)}</Text>
                      <Text style={styles.ticketPlate}>{ticket.plate}</Text>
                    </View>
                    <View style={styles.ticketInfo}>
                      <Text style={styles.ticketType}>{vehicleType?.name}</Text>
                      <Text style={styles.ticketTime}>
                        Entrada: {new Date(ticket.entry_time).toLocaleString()}
                      </Text>
                      {ticket.barcode && (
                        <Text style={styles.ticketBarcode}>Barcode: {ticket.barcode}</Text>
                      )}
                    </View>
                  </AppCard>
                );
              })}
            </View>
          )}

          {filteredTickets.length === 0 && searchQuery && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No se encontraron tickets</Text>
            </View>
          )}
        </AppCard>

        {selectedTicket && (
          <AppCard style={styles.paymentCard}>
            <Text style={styles.paymentTitle}>Procesar Pago</Text>
            
            <View style={styles.ticketPreview}>
              <TicketPreview
                ticket={selectedTicket}
                vehicleType={getVehicleType(selectedTicket)!}
                ratePlan={activeRatePlan!}
                isExit={true}
              />
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.paymentLabel}>Monto a Pagar</Text>
              <Text style={styles.paymentAmount}>
                {formatCurrency(selectedTicket.total || 0)}
              </Text>
            </View>

            <View style={styles.keypadSection}>
              <Keypad
                onPress={handleKeyPress}
                onDelete={() => setPaymentAmount(prev => prev.slice(0, -1))}
                onClear={() => setPaymentAmount('')}
                showEnter={false}
              />
            </View>

            <View style={styles.paymentActions}>
              <AppButton
                title="Cerrar Sin Pago"
                onPress={handleCloseTicket}
                variant="outline"
                loading={isLoading}
                style={styles.actionButton}
              />
              
              <AppButton
                title="Procesar Pago"
                onPress={handleProcessPayment}
                loading={isLoading}
                disabled={!paymentAmount || parseFloat(paymentAmount) < (selectedTicket.total || 0)}
                style={styles.actionButton}
              />
            </View>
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
  ticketsList: {
    marginTop: 16,
    gap: 8,
  },
  ticketCard: {
    padding: 12,
  },
  selectedTicketCard: {
    borderColor: Colors.light.primary,
    borderWidth: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketId: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  ticketPlate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  ticketInfo: {
    gap: 4,
  },
  ticketType: {
    fontSize: 12,
    color: Colors.light.text,
  },
  ticketTime: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  ticketBarcode: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  noResults: {
    padding: 24,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  paymentCard: {
    marginBottom: 16,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  ticketPreview: {
    marginBottom: 16,
  },
  paymentSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  keypadSection: {
    marginBottom: 16,
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
});
