import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Colors } from '@/constants/theme';
import { formatCurrency, formatDateTime } from '@/services/pricing';
import { useTicketsStore } from '@/store/ticketsSlice';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TicketsScreen() {
  const { tickets, loadTickets, isLoading } = useTicketsStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const handleTicketPress = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Tickets</Text>
        <AppButton
          title="Nueva Entrada"
          onPress={() => router.push('/entry/new')}
          size="small"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tickets...</Text>
        </View>
      ) : tickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay tickets</Text>
          <AppButton
            title="Crear Primer Ticket"
            onPress={() => router.push('/entry/new')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <View style={styles.ticketsList}>
          {tickets.map((ticket) => (
            <AppCard
              key={ticket.id}
              style={styles.ticketCard}
              onPress={() => handleTicketPress(ticket.id)}
            >
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketId}>#{ticket.id.substring(0, 8)}</Text>
                <StatusPill 
                  status={ticket.status} 
                  text={ticket.status === 'open' ? 'Abierto' : 'Cerrado'} 
                />
              </View>
              
              <View style={styles.ticketInfo}>
                <Text style={styles.ticketPlate}>{ticket.plate}</Text>
                <Text style={styles.ticketTime}>
                  {formatDateTime(ticket.entry_time)}
                </Text>
                {ticket.total && (
                  <Text style={styles.ticketTotal}>
                    Total: {formatCurrency(ticket.total)}
                  </Text>
                )}
              </View>
            </AppCard>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 200,
  },
  ticketsList: {
    paddingHorizontal: 24,
    gap: 12,
  },
  ticketCard: {
    padding: 16,
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
  ticketInfo: {
    gap: 4,
  },
  ticketPlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  ticketTime: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  ticketTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
