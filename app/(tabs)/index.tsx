import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Colors } from '@/constants/theme';
import { formatCurrency } from '@/services/pricing';
import { useAuthStore } from '@/store/authSlice';
import { useSyncStore } from '@/store/syncSlice';
import { useTicketsStore } from '@/store/ticketsSlice';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, isAuthenticated, loadStoredAuth } = useAuthStore();
  const { openTickets, loadOpenTickets } = useTicketsStore();
  const { isOnline, lastSync, syncInProgress, sync, checkConnection } = useSyncStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      loadStoredAuth();
    } else {
      loadOpenTickets();
      checkConnection();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadOpenTickets(),
        checkConnection(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSync = async () => {
    await sync();
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.authContainer}>
          <Text style={styles.title}>ParkGo</Text>
          <Text style={styles.subtitle}>Sistema de Estacionamiento</Text>
          <AppButton
            title="Iniciar Sesión"
            onPress={() => router.push('/(auth)/sign-in')}
            style={styles.authButton}
          />
        </View>
      </View>
    );
  }

  const totalOpenTickets = openTickets.length;
  const totalRevenue = openTickets.reduce((sum, ticket) => sum + (ticket.total || 0), 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>¡Hola, {user?.email}!</Text>
        <StatusPill 
          status={isOnline ? 'success' : 'error'} 
          text={isOnline ? 'En línea' : 'Sin conexión'} 
        />
      </View>

      <View style={styles.statsContainer}>
        <AppCard style={styles.statCard}>
          <Text style={styles.statNumber}>{totalOpenTickets}</Text>
          <Text style={styles.statLabel}>Tickets Abiertos</Text>
        </AppCard>
        
        <AppCard style={styles.statCard}>
          <Text style={styles.statNumber}>{formatCurrency(totalRevenue)}</Text>
          <Text style={styles.statLabel}>Ingresos del Día</Text>
        </AppCard>
      </View>

      <View style={styles.actionsContainer}>
        <AppButton
          title="Nueva Entrada"
          onPress={() => router.push('/entry/new')}
          style={styles.actionButton}
        />
        
        <AppButton
          title="Cobrar Salida"
          onPress={() => router.push('/exit/charge')}
          variant="secondary"
          style={styles.actionButton}
        />
      </View>


      {lastSync && (
        <View style={styles.syncInfo}>
          <Text style={styles.syncText}>
            Última sincronización: {new Date(lastSync).toLocaleString()}
          </Text>
        </View>
      )}
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
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 32,
  },
  authButton: {
    minWidth: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.text,
    textAlign: 'center',
  },
  actionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  quickActionsCard: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
  },
  syncInfo: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  syncText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
});
