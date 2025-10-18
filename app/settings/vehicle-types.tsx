import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Colors } from '@/constants/theme';
import { useVehicleTypesStore } from '@/store/vehicleTypesSlice';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function VehicleTypesScreen() {
  const { 
    vehicleTypes, 
    loadVehicleTypes, 
    toggleVehicleType, 
    deleteVehicleType,
    isLoading 
  } = useVehicleTypesStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVehicleTypes();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVehicleTypes();
    setRefreshing(false);
  };

  const handleToggleType = async (typeId: string) => {
    try {
      await toggleVehicleType(typeId);
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al cambiar estado');
    }
  };

  const handleDeleteType = async (typeId: string) => {
    Alert.alert(
      'Confirmar Eliminación',
      '¿Estás seguro de que quieres eliminar este tipo de vehículo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicleType(typeId);
              Alert.alert('Éxito', 'Tipo de vehículo eliminado');
            } catch (error) {
              Alert.alert('Error', error instanceof Error ? error.message : 'Error al eliminar tipo');
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
        <Text style={styles.title}>Tipos de Vehículo</Text>
        <AppButton
          title="Nuevo Tipo"
          onPress={() => router.push('/settings/vehicle-types/new')}
          size="small"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tipos...</Text>
        </View>
      ) : vehicleTypes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay tipos de vehículo</Text>
          <AppButton
            title="Crear Primer Tipo"
            onPress={() => router.push('/settings/vehicle-types/new')}
            style={styles.emptyButton}
          />
        </View>
      ) : (
        <View style={styles.typesList}>
          {vehicleTypes.map((type) => (
            <AppCard key={type.id} style={styles.typeCard}>
              <View style={styles.typeHeader}>
                <Text style={styles.typeName}>{type.name}</Text>
                <StatusPill 
                  status={type.is_active ? 'active' : 'inactive'} 
                  text={type.is_active ? 'Activo' : 'Inactivo'} 
                />
              </View>
              
              <View style={styles.typeDetails}>
                <Text style={styles.typeCode}>Código: {type.code}</Text>
              </View>
              
              <View style={styles.typeActions}>
                <AppButton
                  title={type.is_active ? 'Desactivar' : 'Activar'}
                  onPress={() => handleToggleType(type.id)}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
                
                <AppButton
                  title="Editar"
                  onPress={() => router.push(`/settings/vehicle-types/${type.id}`)}
                  variant="outline"
                  size="small"
                  style={styles.actionButton}
                />
                
                <AppButton
                  title="Eliminar"
                  onPress={() => handleDeleteType(type.id)}
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
  typesList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  typeCard: {
    padding: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  typeDetails: {
    marginBottom: 16,
  },
  typeCode: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  typeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});
