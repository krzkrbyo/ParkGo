import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import { useDatabase } from '@/hooks/useDatabase';
import { useTicketsStore } from '@/store/ticketsSlice';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

export default function ExitScreen() {
  const { 
    openTickets, 
    isLoading, 
    error, 
    loadOpenTickets, 
    clearError 
  } = useTicketsStore();

  const { isInitialized, isInitializing, error: dbError } = useDatabase();

  useEffect(() => {
    if (isInitialized) {
      loadOpenTickets();
    }
  }, [isInitialized]);

  const handleRefresh = () => {
    loadOpenTickets();
  };

  const handleProcessExit = (ticketId: string) => {
    router.push(`/exit/charge?ticketId=${ticketId}`);
  };

  const handleScanBarcode = () => {
    router.push('/scan');
  };

  const renderOpenTicket = ({ item }: { item: any }) => (
    <AppCard 
      style={styles.ticketCard}
      onPress={() => handleProcessExit(item.id)}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketPlate}>{item.plate}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
      </View>
      
      <Text style={styles.ticketTime}>
        Entrada: {new Date(item.entry_time).toLocaleString()}
      </Text>
      
      <View style={styles.ticketActions}>
        <AppButton
          title="Procesar Salida"
          onPress={() => handleProcessExit(item.id)}
          size="small"
          style={styles.actionButton}
        />
      </View>
    </AppCard>
  );

  if (isInitializing || (isLoading && openTickets.length === 0)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>
          {isInitializing ? 'Inicializando base de datos...' : 'Cargando tickets abiertos...'}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Procesar Salidas</Text>
        <Text style={styles.subtitle}>Tickets abiertos: {openTickets.length}</Text>
      </View>

      <View style={styles.scanSection}>
        <AppCard style={styles.scanCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="qr-code" size={32} color={Colors.light.primary} />
          </View>
          
          <Text style={styles.scanTitle}>Escanear Ticket</Text>
          <Text style={styles.scanDescription}>
            Escanea el código de barras del ticket
          </Text>
          
          <AppButton
            title="Escanear"
            onPress={handleScanBarcode}
            variant="outline"
            size="small"
            style={styles.scanButton}
          />
        </AppCard>
      </View>

      {openTickets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={64} color={Colors.light.primary} />
          <Text style={styles.emptyTitle}>No hay tickets abiertos</Text>
          <Text style={styles.emptyDescription}>
            Todos los vehículos han salido del estacionamiento
          </Text>
        </View>
      ) : (
        <FlatList
          data={openTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderOpenTicket}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
  },
  scanSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scanCard: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 12,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  scanDescription: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  scanButton: {
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
    marginBottom: 12,
  },
  ticketActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    minWidth: 140,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: 22,
  },
});
