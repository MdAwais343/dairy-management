export type CustomerType = 'spot' | 'khata';
export type PaymentStatus = 'paid' | 'unpaid';
export type PaymentMode = 'نقد' | 'جاز کیش' | 'ایزی پیسہ' | 'بینک';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  default_liters: number;
  price_per_liter: number;
  customer_type: CustomerType;
  is_active: boolean;
  created_at?: string;
}

export interface DailyPickup {
  id: string;
  customer_id: string;
  pickup_date: string; // YYYY-MM-DD
  liters: number;
  rate: number;
  total_amount: number;
  payment_status: PaymentStatus;
  created_at?: string;
}

export interface Payment {
  id: string;
  customer_id: string;
  amount: number;
  payment_date: string; // YYYY-MM-DD
  payment_mode: PaymentMode;
  notes?: string;
  created_at?: string;
}

export interface CustomerLedger {
  customer_id: string;
  name: string;
  phone: string;
  customer_type: CustomerType;
  default_liters: number;
  price_per_liter: number;
  current_month_liters: number;
  current_month_bill: number;
  total_paid: number;
  balance_due: number;
}

export interface DairySettings {
  farm_name: string;
  default_capacity: number;
  current_rate: number;
}

export interface DairyOwner {
  id: string; // references auth.users(id)
  farm_name: string;
  owner_name: string;
  phone: string;
  default_capacity: number;
  created_at?: string;
}

export interface SignUpOwnerData {
  email: string;
  password: string;
  farm_name: string;
  owner_name: string;
  phone: string;
  default_capacity: number;
}
