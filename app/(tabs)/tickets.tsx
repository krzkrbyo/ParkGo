import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusPill } from '@/components/ui/StatusPill';
import { Colors } from '@/constants/theme';
import { useDatabase } from '@/hooks/useDatabase';
import { formatDateTime, formatDuration } from '@/services/pricing';
import { useTicketsStore } from '@/store/ticketsSlice';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function TicketsScreen() {
  const { 
    tickets, 
    openTickets, 
    isLoading, 
    error, 
    loadTickets, 
    loadOpenTickets, 
    clearError 
  } = useTicketsStore();

  const { isInitialized, isInitializing, error: dbError } = useDatabase();

  useEffect(() => {
    if (isInitialized) {
      loadTickets();
      loadOpenTickets();
    }
  }, [isInitialized]);

  const handleRefresh = () => {
    loadTickets();
    loadOpenTickets();
  };

  const handleTicketPress = (ticketId: string) => {
    router.push(`/tickets/${ticketId}`);
  };

  const handleNewTicket = () => {
    router.push('/entry/new');
  };

  const renderTicket = ({ item }: { item: any }) => (
    <AppCard 
      style={styles.ticketCard}
      onPress={() => handleTicketPress(item.id)}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketPlate}>{item.plate}</Text>
        <StatusPill status={item.status} />
      </View>
      
      <Text style={styles.ticketTime}>
        {formatDateTime(item.entry_time)}
      </Text>
      
      {item.status === 'closed' && (
        <View style={styles.ticketFooter}>
          <Text style={styles.ticketDuration}>
            {formatDuration(item.duration_minutes)}
          </Text>
          <Text style={styles.ticketTotal}>
            ${item.total?.toFixed(2) || '0.00'}
          </Text>
        </View>
      )}
    </AppCard>
  );

  if (isInitializing || (isLoading && tickets.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>
          {isInitializing ? 'Inicializando base de datos...' : 'Cargando tickets...'}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <AppButton
          title="Reintentar"
          onPress={handleRefresh}
          style={styles.retryButton}
        />
      </View>
    );
  }

  const allTickets = [...openTickets, ...tickets];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tickets</Text>
        <AppButton
          title="Nueva Entrada"
          onPress={handleNewTicket}
          size="small"
          style={styles.newButton}
        />
      </View>

      {allTickets.length === 0 ? (
        <EmptyState
          icon="receipt-outline"
          title="No hay tickets"
          description="Crea tu primer ticket de estacionamiento"
          action={{
            title: "Nueva Entrada",
            onPress: handleNewTicket,
          }}
        />
      ) : (
        <FlatList
          data={allTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderTicket}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[Colors.light.primary]}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.light.background,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  newButton: {
    minWidth: 120,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  ticketCard: {
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketPlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  ticketTime: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 8,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.text,
  },
  ticketDuration: {
    fontSize: 14,
    color: Colors.light.text,
  },
  ticketTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
});
