// Base model interface with common fields
export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
  device_id: string;
  version: number;
  deleted: boolean;
}

// Vehicle Types
export interface VehicleType extends BaseModel {
  name: string;
  code: string;
  is_active: boolean;
}

// Rate Plans
export interface RatePlan extends BaseModel {
  name: string;
  currency: string;
  rounding_minutes: number;
  daily_max: number | null;
  active: boolean;
}

// Rate Items (pricing rules)
export interface RateItem extends BaseModel {
  rate_plan_id: string;
  vehicle_type_id: string;
  base_minutes: number;
  base_price: number;
  add_minutes: number;
  add_price: number;
  lost_ticket_fee: number | null;
}

// Tickets
export type TicketStatus = 'open' | 'closed';

export interface Ticket extends BaseModel {
  status: TicketStatus;
  vehicle_type_id: string;
  plate: string;
  barcode: string | null;
  entry_time: string;
  exit_time: string | null;
  duration_minutes: number | null;
  rate_plan_id: string;
  total: number | null;
  created_by: string;
  synced_at: string | null;
}

// Payments
export type PaymentMethod = 'cash';

export interface Payment extends BaseModel {
  ticket_id: string;
  method: PaymentMethod;
  amount: number;
  change: number;
}

// Devices
export type ScannerMode = 'HID' | 'CAMERA';

export interface Device extends BaseModel {
  business_name: string;
  ticket_header: string;
  location_name: string;
  printer_name: string | null;
  printer_address: string | null;
  scanner_mode: ScannerMode;
}

// Outbox for sync
export type OutboxOperation = 'insert' | 'update' | 'delete';

export interface OutboxItem extends BaseModel {
  table_name: string;
  row_id: string;
  op: OutboxOperation;
  payload_json: string;
  retries: number;
  last_error: string | null;
}

// Auth types
export interface AuthUser {
  id: string;
  email: string;
  access_token: string;
  refresh_token: string;
}

// Pricing calculation types
export interface PricingCalculation {
  entry: string;
  exit: string;
  vehicleTypeId: string;
  plan: RatePlan;
  rulesForType: RateItem;
}

export interface PricingResult {
  total: number;
  basePrice: number;
  additionalPrice: number;
  durationMinutes: number;
  roundedMinutes: number;
  dailyMaxApplied: boolean;
}

// UI State types
export interface AppState {
  isOnline: boolean;
  lastSync: string | null;
  syncInProgress: boolean;
}

// Form types
export interface VehicleTypeForm {
  name: string;
  code: string;
  is_active: boolean;
}

export interface RatePlanForm {
  name: string;
  currency: string;
  rounding_minutes: number;
  daily_max: number | null;
  active: boolean;
}

export interface RateItemForm {
  rate_plan_id: string;
  vehicle_type_id: string;
  base_minutes: number;
  base_price: number;
  add_minutes: number;
  add_price: number;
  lost_ticket_fee: number | null;
}

export interface TicketForm {
  vehicle_type_id: string;
  plate: string;
  barcode?: string;
}

export interface PaymentForm {
  ticket_id: string;
  method: PaymentMethod;
  amount: number;
  change: number;
}
