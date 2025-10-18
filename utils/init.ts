import { db } from '../db/client';
import { seedDatabase } from '../db/seed';
import { useAuthStore } from '../store/authSlice';
import { useDeviceStore } from '../store/deviceSlice';
import { useRatesStore } from '../store/ratesSlice';
import { useSyncStore } from '../store/syncSlice';
import { useTicketsStore } from '../store/ticketsSlice';
import { useVehicleTypesStore } from '../store/vehicleTypesSlice';

export const initializeApp = async (): Promise<void> => {
  try {
    console.log('Initializing ParkGo app...');
    
    // Initialize database
    await db.init();
    console.log('Database initialized');
    
    // Seed database if empty
    await seedDatabase();
    console.log('Database seeded');
    
    // Initialize stores
    const authStore = useAuthStore.getState();
    const deviceStore = useDeviceStore.getState();
    const vehicleTypesStore = useVehicleTypesStore.getState();
    const ratesStore = useRatesStore.getState();
    const ticketsStore = useTicketsStore.getState();
    const syncStore = useSyncStore.getState();
    
    // Load initial data
    await Promise.all([
      authStore.loadStoredAuth(),
      deviceStore.loadDevice(),
      vehicleTypesStore.loadVehicleTypes(),
      ratesStore.loadRates(),
      ticketsStore.loadOpenTickets(),
      syncStore.checkConnection(),
    ]);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
    throw error;
  }
};
