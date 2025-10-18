import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AboutScreen() {
  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AppCard style={styles.headerCard}>
          <Text style={styles.title}>ParkGo</Text>
          <Text style={styles.subtitle}>Sistema de Estacionamiento</Text>
          <Text style={styles.version}>Versión 1.0.0</Text>
        </AppCard>

        <AppCard style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            ParkGo es un sistema completo de gestión de estacionamientos diseñado 
            para funcionar de manera offline-first, con sincronización automática 
            y compatibilidad con Expo Go.
          </Text>
        </AppCard>

        <AppCard style={styles.featuresCard}>
          <Text style={styles.sectionTitle}>Características</Text>
          
          <Text style={styles.featureItem}>• Autenticación OTP por email</Text>
          <Text style={styles.featureItem}>• Gestión offline con sincronización</Text>
          <Text style={styles.featureItem}>• CRUD de tipos de vehículo y tarifas</Text>
          <Text style={styles.featureItem}>• Sistema de tickets con entrada/salida</Text>
          <Text style={styles.featureItem}>• Cálculo automático de precios</Text>
          <Text style={styles.featureItem}>• Impresión de tickets térmicos</Text>
          <Text style={styles.featureItem}>• Escaneo de códigos de barras</Text>
          <Text style={styles.featureItem}>• Interfaz moderna con NativeWind</Text>
        </AppCard>

        <AppCard style={styles.techCard}>
          <Text style={styles.sectionTitle}>Tecnologías</Text>
          
          <Text style={styles.techItem}>• React Native + Expo Router</Text>
          <Text style={styles.techItem}>• TypeScript</Text>
          <Text style={styles.techItem}>• NativeWind (Tailwind CSS)</Text>
          <Text style={styles.techItem}>• Zustand (State Management)</Text>
          <Text style={styles.techItem}>• SQLite (Base de datos local)</Text>
          <Text style={styles.techItem}>• Supabase (Backend y Auth)</Text>
          <Text style={styles.techItem}>• Expo Print (Impresión)</Text>
          <Text style={styles.techItem}>• Expo Barcode Scanner</Text>
        </AppCard>

        <AppCard style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Contacto</Text>
          
          <AppButton
            title="GitHub"
            onPress={() => handleOpenLink('https://github.com/parkgo')}
            variant="outline"
            style={styles.contactButton}
          />
          
          <AppButton
            title="Documentación"
            onPress={() => handleOpenLink('https://docs.parkgo.com')}
            variant="outline"
            style={styles.contactButton}
          />
          
          <AppButton
            title="Soporte"
            onPress={() => handleOpenLink('mailto:soporte@parkgo.com')}
            variant="outline"
            style={styles.contactButton}
          />
        </AppCard>

        <AppCard style={styles.licenseCard}>
          <Text style={styles.sectionTitle}>Licencia</Text>
          <Text style={styles.licenseText}>
            Este proyecto está bajo la Licencia MIT. Ver el archivo LICENSE 
            para más detalles.
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
  headerCard: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.text,
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.7,
  },
  infoCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  featuresCard: {
    padding: 16,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
  },
  techCard: {
    padding: 16,
  },
  techItem: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
  },
  contactCard: {
    padding: 16,
  },
  contactButton: {
    marginBottom: 8,
  },
  licenseCard: {
    padding: 16,
  },
  licenseText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
});
