import { create } from 'zustand';
import { db } from '../db/client';
import { RateItem, RateItemForm, RatePlan, RatePlanForm } from '../types/models';

interface RatesState {
  ratePlans: RatePlan[];
  rateItems: RateItem[];
  activeRatePlan: RatePlan | null;
  isLoading: boolean;
  error: string | null;
}

interface RatesActions {
  setRatePlans: (plans: RatePlan[]) => void;
  setRateItems: (items: RateItem[]) => void;
  setActiveRatePlan: (plan: RatePlan | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  loadRates: () => Promise<void>;
  createRatePlan: (form: RatePlanForm) => Promise<void>;
  updateRatePlan: (id: string, form: RatePlanForm) => Promise<void>;
  activateRatePlan: (id: string) => Promise<void>;
  deleteRatePlan: (id: string) => Promise<void>;
  createRateItem: (form: RateItemForm) => Promise<void>;
  updateRateItem: (id: string, form: RateItemForm) => Promise<void>;
  deleteRateItem: (id: string) => Promise<void>;
  getRateItemsForPlan: (planId: string) => RateItem[];
  getRateItemForVehicleType: (planId: string, vehicleTypeId: string) => RateItem | null;
  clearError: () => void;
}

type RatesStore = RatesState & RatesActions;

export const useRatesStore = create<RatesStore>((set, get) => ({
  // State
  ratePlans: [],
  rateItems: [],
  activeRatePlan: null,
  isLoading: false,
  error: null,

  // Actions
  setRatePlans: (ratePlans) => set({ ratePlans, error: null }),

  setRateItems: (rateItems) => set({ rateItems, error: null }),

  setActiveRatePlan: (activeRatePlan) => set({ activeRatePlan, error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  loadRates: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Ensure database is initialized
      if (!db.isInitialized()) {
        await db.init();
      }
      
      const [plans, items] = await Promise.all([
        db.findAll<RatePlan>('rate_plans'),
        db.findAll<RateItem>('rate_items')
      ]);
      
      const activePlan = plans.find(plan => plan.active);
      
      set({ 
        ratePlans: plans, 
        rateItems: items,
        activeRatePlan: activePlan || null,
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading rates:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load rates',
        isLoading: false 
      });
    }
  },

  createRatePlan: async (form) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if name already exists
      const existing = await db.findOne<RatePlan>('rate_plans', 'name = ?', [form.name]);
      if (existing) {
        throw new Error('Ya existe un plan de tarifas con este nombre');
      }

      await db.insert<RatePlan>('rate_plans', form);
      await get().loadRates();
    } catch (error) {
      console.error('Error creating rate plan:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create rate plan',
        isLoading: false 
      });
    }
  },

  updateRatePlan: async (id, form) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if name already exists (excluding current record)
      const existing = await db.findOne<RatePlan>('rate_plans', 'name = ? AND id != ?', [form.name, id]);
      if (existing) {
        throw new Error('Ya existe un plan de tarifas con este nombre');
      }

      await db.update('rate_plans', id, form);
      await get().loadRates();
    } catch (error) {
      console.error('Error updating rate plan:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update rate plan',
        isLoading: false 
      });
    }
  },

  activateRatePlan: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Deactivate all other plans
      const { ratePlans } = get();
      for (const plan of ratePlans) {
        if (plan.id !== id && plan.active) {
          await db.update('rate_plans', plan.id, { active: false });
        }
      }

      // Activate selected plan
      await db.update('rate_plans', id, { active: true });
      await get().loadRates();
    } catch (error) {
      console.error('Error activating rate plan:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to activate rate plan',
        isLoading: false 
      });
    }
  },

  deleteRatePlan: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if rate plan is referenced in tickets
      const tickets = await db.findAll('tickets', 'rate_plan_id = ?', [id]);
      if (tickets.length > 0) {
        throw new Error('No se puede eliminar un plan de tarifas que tiene tickets asociados');
      }

      // Delete associated rate items first
      const rateItems = await db.findAll('rate_items', 'rate_plan_id = ?', [id]);
      for (const item of rateItems) {
        await db.softDelete('rate_items', item.id);
      }

      await db.softDelete('rate_plans', id);
      await get().loadRates();
    } catch (error) {
      console.error('Error deleting rate plan:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete rate plan',
        isLoading: false 
      });
    }
  },

  createRateItem: async (form) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if combination already exists
      const existing = await db.findOne<RateItem>('rate_items', 'rate_plan_id = ? AND vehicle_type_id = ?', [form.rate_plan_id, form.vehicle_type_id]);
      if (existing) {
        throw new Error('Ya existe una tarifa para este plan y tipo de vehículo');
      }

      await db.insert<RateItem>('rate_items', form);
      await get().loadRates();
    } catch (error) {
      console.error('Error creating rate item:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create rate item',
        isLoading: false 
      });
    }
  },

  updateRateItem: async (id, form) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if combination already exists (excluding current record)
      const existing = await db.findOne<RateItem>('rate_items', 'rate_plan_id = ? AND vehicle_type_id = ? AND id != ?', [form.rate_plan_id, form.vehicle_type_id, id]);
      if (existing) {
        throw new Error('Ya existe una tarifa para este plan y tipo de vehículo');
      }

      await db.update('rate_items', id, form);
      await get().loadRates();
    } catch (error) {
      console.error('Error updating rate item:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update rate item',
        isLoading: false 
      });
    }
  },

  deleteRateItem: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await db.softDelete('rate_items', id);
      await get().loadRates();
    } catch (error) {
      console.error('Error deleting rate item:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete rate item',
        isLoading: false 
      });
    }
  },

  getRateItemsForPlan: (planId) => {
    const { rateItems } = get();
    return rateItems.filter(item => item.rate_plan_id === planId);
  },

  getRateItemForVehicleType: (planId, vehicleTypeId) => {
    const { rateItems } = get();
    return rateItems.find(item => 
      item.rate_plan_id === planId && 
      item.vehicle_type_id === vehicleTypeId
    ) || null;
  },

  clearError: () => set({ error: null }),
}));
