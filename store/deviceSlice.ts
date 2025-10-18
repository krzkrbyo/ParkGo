import { create } from 'zustand';
import { db } from '../db/client';
import { getDeviceId } from '../services/ids';
import { Device, ScannerMode } from '../types/models';

interface DeviceState {
  device: Device | null;
  isLoading: boolean;
  error: string | null;
}

interface DeviceActions {
  setDevice: (device: Device | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadDevice: () => Promise<void>;
  updateDevice: (updates: Partial<Device>) => Promise<void>;
  updateScannerMode: (mode: ScannerMode) => Promise<void>;
  updatePrinterSettings: (printerName: string | null, printerAddress: string | null) => Promise<void>;
  clearError: () => void;
}

type DeviceStore = DeviceState & DeviceActions;

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  // State
  device: null,
  isLoading: false,
  error: null,

  // Actions
  setDevice: (device) => set({ device, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  loadDevice: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const deviceId = await getDeviceId();
      const device = await db.findOne<Device>('devices', 'device_id = ?', [deviceId]);
      
      if (device) {
        set({ device, isLoading: false });
      } else {
        // Create default device if none exists
        const defaultDevice: Omit<Device, keyof any> = {
          business_name: 'ParkGo Estacionamiento',
          ticket_header: 'PARKGO\nEstacionamiento',
          location_name: 'Ubicación Principal',
          printer_name: null,
          printer_address: null,
          scanner_mode: 'HID',
        };
        
        const id = await db.insert<Device>('devices', defaultDevice);
        const newDevice = await db.findById<Device>('devices', id);
        set({ device: newDevice, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading device:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load device settings',
        isLoading: false 
      });
    }
  },

  updateDevice: async (updates) => {
    const { device } = get();
    if (!device) return;

    set({ isLoading: true, error: null });
    
    try {
      await db.update('devices', device.id, updates);
      const updatedDevice = await db.findById<Device>('devices', device.id);
      set({ device: updatedDevice, isLoading: false });
    } catch (error) {
      console.error('Error updating device:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update device settings',
        isLoading: false 
      });
    }
  },

  updateScannerMode: async (mode) => {
    const { updateDevice } = get();
    await updateDevice({ scanner_mode: mode });
  },

  updatePrinterSettings: async (printerName, printerAddress) => {
    const { updateDevice } = get();
    await updateDevice({ 
      printer_name: printerName, 
      printer_address: printerAddress 
    });
  },

  clearError: () => set({ error: null }),
}));
