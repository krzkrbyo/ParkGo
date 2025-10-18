import { calculateTotal } from '../services/pricing';
import { RateItem, RatePlan } from '../types/models';

describe('Pricing Service', () => {
  const mockRatePlan: RatePlan = {
    id: '1',
    name: 'Plan Base',
    currency: 'USD',
    rounding_minutes: 15,
    daily_max: 10.0,
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    device_id: 'device1',
    version: 1,
    deleted: false,
  };

  const mockRateItem: RateItem = {
    id: '1',
    rate_plan_id: '1',
    vehicle_type_id: '1',
    base_minutes: 60,
    base_price: 1.50,
    add_minutes: 15,
    add_price: 0.50,
    lost_ticket_fee: 5.0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    device_id: 'device1',
    version: 1,
    deleted: false,
  };

  describe('calculateTotal', () => {
    it('should calculate base price for duration within base minutes', () => {
      const entry = '2024-01-01T10:00:00Z';
      const exit = '2024-01-01T10:30:00Z'; // 30 minutes

      const result = calculateTotal({
        entry,
        exit,
        vehicleTypeId: '1',
        plan: mockRatePlan,
        rulesForType: mockRateItem,
      });

      expect(result.total).toBe(1.50);
      expect(result.basePrice).toBe(1.50);
      expect(result.additionalPrice).toBe(0);
      expect(result.durationMinutes).toBe(30);
      expect(result.roundedMinutes).toBe(30);
      expect(result.dailyMaxApplied).toBe(false);
    });

    it('should calculate base price plus additional for duration exceeding base minutes', () => {
      const entry = '2024-01-01T10:00:00Z';
      const exit = '2024-01-01T11:30:00Z'; // 90 minutes

      const result = calculateTotal({
        entry,
        exit,
        vehicleTypeId: '1',
        plan: mockRatePlan,
        rulesForType: mockRateItem,
      });

      expect(result.total).toBe(2.50); // 1.50 base + 1.00 additional (2 blocks of 15 min)
      expect(result.basePrice).toBe(1.50);
      expect(result.additionalPrice).toBe(1.00);
      expect(result.durationMinutes).toBe(90);
      expect(result.roundedMinutes).toBe(90);
      expect(result.dailyMaxApplied).toBe(false);
    });

    it('should apply rounding to minutes', () => {
      const entry = '2024-01-01T10:00:00Z';
      const exit = '2024-01-01T10:37:00Z'; // 37 minutes, should round to 45

      const result = calculateTotal({
        entry,
        exit,
        vehicleTypeId: '1',
        plan: mockRatePlan,
        rulesForType: mockRateItem,
      });

      expect(result.roundedMinutes).toBe(45);
      expect(result.total).toBe(1.50); // Only base price for 45 minutes
    });

    it('should apply daily max when total exceeds limit', () => {
      const entry = '2024-01-01T10:00:00Z';
      const exit = '2024-01-01T18:00:00Z'; // 8 hours = 480 minutes

      const result = calculateTotal({
        entry,
        exit,
        vehicleTypeId: '1',
        plan: mockRatePlan,
        rulesForType: mockRateItem,
      });

      expect(result.total).toBe(10.0); // Daily max applied
      expect(result.dailyMaxApplied).toBe(true);
    });

    it('should handle exact base minutes', () => {
      const entry = '2024-01-01T10:00:00Z';
      const exit = '2024-01-01T11:00:00Z'; // Exactly 60 minutes

      const result = calculateTotal({
        entry,
        exit,
        vehicleTypeId: '1',
        plan: mockRatePlan,
        rulesForType: mockRateItem,
      });

      expect(result.total).toBe(1.50);
      expect(result.basePrice).toBe(1.50);
      expect(result.additionalPrice).toBe(0);
      expect(result.durationMinutes).toBe(60);
      expect(result.roundedMinutes).toBe(60);
    });

    it('should handle zero duration', () => {
      const entry = '2024-01-01T10:00:00Z';
      const exit = '2024-01-01T10:00:00Z'; // 0 minutes

      const result = calculateTotal({
        entry,
        exit,
        vehicleTypeId: '1',
        plan: mockRatePlan,
        rulesForType: mockRateItem,
      });

      expect(result.total).toBe(1.50); // Base price still applies
      expect(result.durationMinutes).toBe(0);
      expect(result.roundedMinutes).toBe(0);
    });

    it('should handle plan without daily max', () => {
      const planWithoutMax = { ...mockRatePlan, daily_max: null };
      const entry = '2024-01-01T10:00:00Z';
      const exit = '2024-01-01T18:00:00Z'; // 8 hours

      const result = calculateTotal({
        entry,
        exit,
        vehicleTypeId: '1',
        plan: planWithoutMax,
        rulesForType: mockRateItem,
      });

      expect(result.dailyMaxApplied).toBe(false);
      expect(result.total).toBeGreaterThan(10.0); // No daily max applied
    });
  });
});
