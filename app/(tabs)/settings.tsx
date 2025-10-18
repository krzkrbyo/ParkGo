import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const handleVehicleTypes = () => {
    router.push('/settings/vehicle-types');
  };

  const handleRates = () => {
    router.push('/settings/rates');
  };

  const handleDevice = () => {
    router.push('/settings/device');
  };

  const handleSync = () => {
    router.push('/sync');
  };

  const handleAbout = () => {
    router.push('/about');
  };

  const handleSignOut = () => {
    // TODO: Implement sign out
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
        <Text style={styles.subtitle}>Gestiona tu estacionamiento</Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Catálogos</Text>
          
          <View style={styles.menuItem} onTouchEnd={handleVehicleTypes}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="car" size={24} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Tipos de Vehículo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </View>

          <View style={styles.menuItem} onTouchEnd={handleRates}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="cash" size={24} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Tarifas</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </View>
        </AppCard>

        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Sistema</Text>
          
          <View style={styles.menuItem} onTouchEnd={handleDevice}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="hardware-chip" size={24} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Dispositivo</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </View>

          <View style={styles.menuItem} onTouchEnd={handleSync}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="sync" size={24} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Sincronización</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </View>
        </AppCard>

        <AppCard style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>
          
          <View style={styles.menuItem} onTouchEnd={handleAbout}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="information-circle" size={24} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Acerca de</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.text} />
          </View>
        </AppCard>

        <View style={styles.signOutSection}>
          <AppButton
            title="Cerrar Sesión"
            onPress={handleSignOut}
            variant="danger"
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.text,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  signOutSection: {
    marginTop: 20,
    marginBottom: 40,
  },
  signOutButton: {
    minWidth: 200,
    alignSelf: 'center',
  },
});
