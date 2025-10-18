import { differenceInMinutes, format, parseISO } from 'date-fns';
import { PricingCalculation, PricingResult, RateItem } from '../types/models';

export const calculateTotal = ({
  entry,
  exit,
  vehicleTypeId,
  plan,
  rulesForType,
}: PricingCalculation): PricingResult => {
  const entryTime = parseISO(entry);
  const exitTime = parseISO(exit);
  
  // Calculate duration in minutes
  const durationMinutes = differenceInMinutes(exitTime, entryTime);
  
  // Apply rounding
  const roundedMinutes = Math.ceil(durationMinutes / plan.rounding_minutes) * plan.rounding_minutes;
  
  // Calculate base price
  const basePrice = rulesForType.base_price;
  
  // Calculate additional price
  let additionalPrice = 0;
  if (roundedMinutes > rulesForType.base_minutes) {
    const additionalMinutes = roundedMinutes - rulesForType.base_minutes;
    const additionalBlocks = Math.ceil(additionalMinutes / rulesForType.add_minutes);
    additionalPrice = additionalBlocks * rulesForType.add_price;
  }
  
  // Calculate total before daily max
  let total = basePrice + additionalPrice;
  
  // Apply daily max if it exists
  const dailyMaxApplied = plan.daily_max !== null && total > plan.daily_max;
  if (dailyMaxApplied) {
    total = plan.daily_max!;
  }
  
  return {
    total,
    basePrice,
    additionalPrice,
    durationMinutes,
    roundedMinutes,
    dailyMaxApplied,
  };
};

export const calculateLostTicketFee = (rulesForType: RateItem): number => {
  return rulesForType.lost_ticket_fee || 0;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd/MM/yyyy HH:mm');
};
