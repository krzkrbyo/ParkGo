import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { StatusPill } from '@/components/ui/StatusPill';
import { Colors } from '@/constants/theme';
import { useSyncStore } from '@/store/syncSlice';
import React, { useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SyncScreen() {
  const { 
    isOnline, 
    lastSync, 
    syncInProgress, 
    error,
    checkConnection, 
    sync, 
    clearError 
  } = useSyncStore();
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkConnection();
    setRefreshing(false);
  };

  const handleSync = async () => {
    try {
      await sync();
      if (!error) {
        Alert.alert('Éxito', 'Sincronización completada');
      }
    } catch (error) {
      Alert.alert('Error', 'Error durante la sincronización');
    }
  };

  const handleClearError = () => {
    clearError();
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <View style={styles.content}>
        <AppCard style={styles.statusCard}>
          <Text style={styles.title}>Estado de Sincronización</Text>
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Conexión:</Text>
            <StatusPill 
              status={isOnline ? 'success' : 'error'} 
              text={isOnline ? 'En línea' : 'Sin conexión'} 
            />
          </View>
          
          {lastSync && (
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Última sincronización:</Text>
              <Text style={styles.statusValue}>
                {new Date(lastSync).toLocaleString()}
              </Text>
            </View>
          )}
          
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Estado:</Text>
            <StatusPill 
              status={syncInProgress ? 'warning' : 'success'} 
              text={syncInProgress ? 'Sincronizando...' : 'Listo'} 
            />
          </View>
        </AppCard>

        {error && (
          <AppCard style={styles.errorCard}>
            <Text style={styles.errorTitle}>Error de Sincronización</Text>
            <Text style={styles.errorText}>{error}</Text>
            <AppButton
              title="Limpiar Error"
              onPress={handleClearError}
              variant="outline"
              size="small"
              style={styles.errorButton}
            />
          </AppCard>
        )}

        <AppCard style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          
          <AppButton
            title="Verificar Conexión"
            onPress={checkConnection}
            variant="outline"
            style={styles.actionButton}
          />
          
          <AppButton
            title="Sincronizar Ahora"
            onPress={handleSync}
            loading={syncInProgress}
            disabled={!isOnline}
            style={styles.actionButton}
          />
        </AppCard>

        <AppCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <Text style={styles.infoText}>
            La sincronización permite mantener tus datos actualizados entre dispositivos.
          </Text>
          
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Push:</Text> Envía cambios locales al servidor
          </Text>
          
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Pull:</Text> Descarga cambios del servidor
          </Text>
          
          <Text style={styles.infoText}>
            • <Text style={styles.infoBold}>Offline:</Text> Los datos se guardan localmente
          </Text>
        </AppCard>
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
  statusCard: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  statusValue: {
    fontSize: 14,
    color: Colors.light.text,
  },
  errorCard: {
    padding: 16,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginBottom: 12,
  },
  errorButton: {
    alignSelf: 'flex-start',
  },
  actionsCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  infoCard: {
    padding: 16,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  infoBold: {
    fontWeight: '600',
  },
});
