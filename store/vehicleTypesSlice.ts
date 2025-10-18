import { create } from 'zustand';
import { db } from '../db/client';
import { VehicleType, VehicleTypeForm } from '../types/models';

interface VehicleTypesState {
  vehicleTypes: VehicleType[];
  isLoading: boolean;
  error: string | null;
}

interface VehicleTypesActions {
  setVehicleTypes: (types: VehicleType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadVehicleTypes: () => Promise<void>;
  createVehicleType: (form: VehicleTypeForm) => Promise<void>;
  updateVehicleType: (id: string, form: VehicleTypeForm) => Promise<void>;
  toggleVehicleType: (id: string) => Promise<void>;
  deleteVehicleType: (id: string) => Promise<void>;
  clearError: () => void;
}

type VehicleTypesStore = VehicleTypesState & VehicleTypesActions;

export const useVehicleTypesStore = create<VehicleTypesStore>((set, get) => ({
  // State
  vehicleTypes: [],
  isLoading: false,
  error: null,

  // Actions
  setVehicleTypes: (vehicleTypes) => set({ vehicleTypes, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  loadVehicleTypes: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Ensure database is initialized
      if (!db.isInitialized()) {
        await db.init();
      }
      
      const types = await db.findAll<VehicleType>('vehicle_types', 'is_active = 1');
      set({ vehicleTypes: types, isLoading: false });
    } catch (error) {
      console.error('Error loading vehicle types:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load vehicle types',
        isLoading: false 
      });
    }
  },

  createVehicleType: async (form) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if name or code already exists
      const existingByName = await db.findOne<VehicleType>('vehicle_types', 'name = ?', [form.name]);
      if (existingByName) {
        throw new Error('Ya existe un tipo de vehículo con este nombre');
      }

      const existingByCode = await db.findOne<VehicleType>('vehicle_types', 'code = ?', [form.code]);
      if (existingByCode) {
        throw new Error('Ya existe un tipo de vehículo con este código');
      }

      await db.insert<VehicleType>('vehicle_types', form);
      await get().loadVehicleTypes();
    } catch (error) {
      console.error('Error creating vehicle type:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create vehicle type',
        isLoading: false 
      });
    }
  },

  updateVehicleType: async (id, form) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if name or code already exists (excluding current record)
      const existingByName = await db.findOne<VehicleType>('vehicle_types', 'name = ? AND id != ?', [form.name, id]);
      if (existingByName) {
        throw new Error('Ya existe un tipo de vehículo con este nombre');
      }

      const existingByCode = await db.findOne<VehicleType>('vehicle_types', 'code = ? AND id != ?', [form.code, id]);
      if (existingByCode) {
        throw new Error('Ya existe un tipo de vehículo con este código');
      }

      await db.update('vehicle_types', id, form);
      await get().loadVehicleTypes();
    } catch (error) {
      console.error('Error updating vehicle type:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update vehicle type',
        isLoading: false 
      });
    }
  },

  toggleVehicleType: async (id) => {
    const { vehicleTypes } = get();
    const type = vehicleTypes.find(t => t.id === id);
    if (!type) return;

    set({ isLoading: true, error: null });
    
    try {
      await db.update('vehicle_types', id, { is_active: !type.is_active });
      await get().loadVehicleTypes();
    } catch (error) {
      console.error('Error toggling vehicle type:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to toggle vehicle type',
        isLoading: false 
      });
    }
  },

  deleteVehicleType: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if vehicle type is referenced in tickets
      const tickets = await db.findAll('tickets', 'vehicle_type_id = ?', [id]);
      if (tickets.length > 0) {
        throw new Error('No se puede eliminar un tipo de vehículo que tiene tickets asociados');
      }

      // Check if vehicle type is referenced in rate items
      const rateItems = await db.findAll('rate_items', 'vehicle_type_id = ?', [id]);
      if (rateItems.length > 0) {
        throw new Error('No se puede eliminar un tipo de vehículo que tiene tarifas asociadas');
      }

      await db.softDelete('vehicle_types', id);
      await get().loadVehicleTypes();
    } catch (error) {
      console.error('Error deleting vehicle type:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete vehicle type',
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
}));
