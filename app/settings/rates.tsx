import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import { formatCurrency } from '@/services/pricing';
import { useRatesStore } from '@/store/ratesSlice';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RatesScreen() {
  const { 
    ratePlans, 
    rateItems, 
    activeRatePlan, 
    loadRates, 
    activateRatePlan, 
    deleteRatePlan,
    isLoading 
  } = useRatesStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRates();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRates();
    setRefreshing(false);
  };

  const handleActivatePlan = async (planId: string) => {
    try {
      await activateRatePlan(planId);
      Alert.alert('Éxito', 'Plan de tarifas activado');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al activar plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este plan de tarifas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRatePlan(planId);
              Alert.alert('Éxito', 'Plan eliminado');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Error al eliminar plan');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Planes de Tarifas</Text>
        <AppButton
          title="Nuevo Plan"
          onPress={() => router.push('/settings/rates/new')}
          size="small"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando planes...</Text>
        </View>
      ) : ratePlans.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay planes de tarifas</Text>
          <AppButton
            title="Crear Primer Plan"
            onPress={() => router.push('/settings/rates/new')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <View style={styles.plansList}>
          {ratePlans.map((plan) => (
            <AppCard key={plan.id} style={styles.planCard}>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {plan.active && (
                  <Text style={styles.activeBadge}>ACTIVO</Text>
                )}
              </View>
              
              <View style={styles.planDetails}>
                <Text style={styles.planDetail}>
                  Moneda: {plan.currency}
                </Text>
                <Text style={styles.planDetail}>
                  Redondeo: {plan.rounding_minutes} min
                </Text>
                {plan.daily_max && (
                  <Text style={styles.planDetail}>
                    Máximo diario: {formatCurrency(plan.daily_max, plan.currency)}
                  </Text>
                )}
                <Text style={styles.planDetail}>
                  Reglas: {rateItems.filter(item => item.rate_plan_id === plan.id).length}
                </Text>
              </View>
              
              <View style={styles.planActions}>
                {!plan.active && (
                  <AppButton
                    title="Activar"
                    onPress={() => handleActivatePlan(plan.id)}
                    variant="outline"
                    size="small"
                    style={styles.actionButton}
                  />
                )}
                
                <AppButton
                  title="Editar"
                  onPress={() => router.push(`/settings/rates/${plan.id}`)}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
                
                <AppButton
                  title="Eliminar"
                  onPress={() => handleDeletePlan(plan.id)}
                  variant="danger"
                  size="small"
                  style={styles.actionButton}
                />
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
  plansList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  planCard: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  activeBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.primary,
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  planDetails: {
    marginBottom: 16,
  },
  planDetail: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 4,
  },
  planActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
