import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EntryScreen() {
  const handleNewTicket = () => {
    router.push('/entry/new');
  };

  const handleScanBarcode = () => {
    router.push('/scan');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nueva Entrada</Text>
        <Text style={styles.subtitle}>Registra un nuevo vehículo</Text>
      </View>

      <View style={styles.content}>
        <AppCard style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="car" size={48} color={Colors.light.primary} />
          </View>
          
          <Text style={styles.cardTitle}>Entrada Manual</Text>
          <Text style={styles.cardDescription}>
            Ingresa los datos del vehículo manualmente
          </Text>
          
          <AppButton
            title="Crear Ticket"
            onPress={handleNewTicket}
            style={styles.button}
          />
        </AppCard>

        <AppCard style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons name="qr-code" size={48} color={Colors.light.primary} />
          </View>
          
          <Text style={styles.cardTitle}>Escanear Código</Text>
          <Text style={styles.cardDescription}>
            Escanea el código de barras del vehículo
          </Text>
          
          <AppButton
            title="Escanear"
            onPress={handleScanBarcode}
            variant="outline"
            style={styles.button}
          />
        </AppCard>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    minWidth: 200,
  },
});
