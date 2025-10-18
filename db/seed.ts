import { RateItem, RatePlan, VehicleType } from '../types/models';
import { db } from './client';

export const seedDatabase = async (): Promise<void> => {
  try {
    await db.init();
    
    // Check if database is already seeded
    const existingVehicleTypes = await db.findAll<VehicleType>('vehicle_types');
    if (existingVehicleTypes.length > 0) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database...');

    // Seed Vehicle Types
    const vehicleTypes: Omit<VehicleType, keyof any>[] = [
      { name: 'Auto', code: 'AUTO', is_active: true },
      { name: 'Moto', code: 'MOTO', is_active: true },
      { name: 'Pickup', code: 'PICKUP', is_active: true },
    ];

    const vehicleTypeIds: string[] = [];
    for (const vt of vehicleTypes) {
      const id = await db.insert<VehicleType>('vehicle_types', vt);
      vehicleTypeIds.push(id);
    }

    // Seed Rate Plan
    const ratePlanId = await db.insert<RatePlan>('rate_plans', {
      name: 'Plan Base',
      currency: 'USD',
      rounding_minutes: 15,
      daily_max: 10.0,
      active: true,
    });

    // Seed Rate Items for each vehicle type
    const rateItems: Omit<RateItem, keyof any>[] = [
      // Auto rates
      {
        rate_plan_id: ratePlanId,
        vehicle_type_id: vehicleTypeIds[0], // Auto
        base_minutes: 60,
        base_price: 1.50,
        add_minutes: 15,
        add_price: 0.50,
        lost_ticket_fee: 5.0,
      },
      // Moto rates
      {
        rate_plan_id: ratePlanId,
        vehicle_type_id: vehicleTypeIds[1], // Moto
        base_minutes: 60,
        base_price: 1.00,
        add_minutes: 15,
        add_price: 0.25,
        lost_ticket_fee: 3.0,
      },
      // Pickup rates
      {
        rate_plan_id: ratePlanId,
        vehicle_type_id: vehicleTypeIds[2], // Pickup
        base_minutes: 60,
        base_price: 2.00,
        add_minutes: 15,
        add_price: 0.75,
        lost_ticket_fee: 8.0,
      },
    ];

    for (const ri of rateItems) {
      await db.insert<RateItem>('rate_items', ri);
    }

    // Seed default device
    await db.insert('devices', {
      business_name: 'ParkGo Estacionamiento',
      ticket_header: 'PARKGO\nEstacionamiento',
      location_name: 'Ubicación Principal',
      printer_name: null,
      printer_address: null,
      scanner_mode: 'HID',
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};
