import { create } from 'zustand';
import { Customer, DailyPickup, Payment, CustomerLedger, PaymentMode } from '../types/database.types';
import { api, isSupabaseConfigured } from '../lib/supabase';
import { triggerHaptic } from '../lib/haptics';

// Helpers for dates
export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentYearMonth = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// UUID helper functions
export const isUUID = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Seed realistic Pakistani dairy customers with valid standard UUIDs (matching supabase seed)
const INITIAL_DEMO_CUSTOMERS: Customer[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    name: 'چوہدری طارق گجر',
    phone: '03001234567',
    default_liters: 3.0,
    price_per_liter: 240,
    customer_type: 'khata',
    is_active: true,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000002',
    name: 'حاجی اسلم صاحب',
    phone: '03017654321',
    default_liters: 2.0,
    price_per_liter: 240,
    customer_type: 'khata',
    is_active: true,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000003',
    name: 'میاں بلال صاحب',
    phone: '03219876543',
    default_liters: 2.5,
    price_per_liter: 240,
    customer_type: 'khata',
    is_active: true,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000004',
    name: 'ملک رشید اعوان',
    phone: '03335551234',
    default_liters: 1.5,
    price_per_liter: 240,
    customer_type: 'spot',
    is_active: true,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000005',
    name: 'شیخ ندیم کریانہ سٹور',
    phone: '03024449876',
    default_liters: 5.0,
    price_per_liter: 235,
    customer_type: 'khata',
    is_active: true,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000006',
    name: 'ماسٹر اکرم صاحب',
    phone: '03456667788',
    default_liters: 2.0,
    price_per_liter: 240,
    customer_type: 'khata',
    is_active: true,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000007',
    name: 'رانا زاہد حسین',
    phone: '03123334455',
    default_liters: 1.0,
    price_per_liter: 240,
    customer_type: 'spot',
    is_active: true,
  },
  {
    id: 'a1000000-0000-0000-0000-000000000008',
    name: 'ڈاکٹر رضوان احمد',
    phone: '03038889900',
    default_liters: 3.0,
    price_per_liter: 240,
    customer_type: 'khata',
    is_active: true,
  }
];

// Generate past 20 days pickups for demo
const generateDemoPickups = (customers: Customer[]): DailyPickup[] => {
  const pickups: DailyPickup[] = [];
  const today = new Date();
  
  for (let i = 1; i <= 20; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    customers.forEach(c => {
      // Pickups for most customers
      pickups.push({
        id: `pickup-${c.id}-${dateStr}`,
        customer_id: c.id,
        pickup_date: dateStr,
        liters: c.default_liters,
        rate: c.price_per_liter,
        total_amount: c.default_liters * c.price_per_liter,
        payment_status: c.customer_type === 'spot' ? 'paid' : 'unpaid'
      });
    });
  }

  // Also pre-seed a couple for today
  const todayStr = getTodayDateString();
  pickups.push({
    id: `pickup-a1-${todayStr}`,
    customer_id: 'a1000000-0000-0000-0000-000000000001',
    pickup_date: todayStr,
    liters: 3.0,
    rate: 240,
    total_amount: 720,
    payment_status: 'unpaid'
  });
  pickups.push({
    id: `pickup-a4-${todayStr}`,
    customer_id: 'a1000000-0000-0000-0000-000000000004',
    pickup_date: todayStr,
    liters: 1.5,
    rate: 240,
    total_amount: 360,
    payment_status: 'paid'
  });

  return pickups;
};

// Seed demo payments
const INITIAL_DEMO_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    customer_id: 'a1000000-0000-0000-0000-000000000001',
    amount: 5000,
    payment_date: getTodayDateString(),
    payment_mode: 'نقد',
    notes: 'پہلی قسط وصولی',
  },
  {
    id: 'pay-2',
    customer_id: 'a1000000-0000-0000-0000-000000000002',
    amount: 3000,
    payment_date: getTodayDateString(),
    payment_mode: 'جاز کیش',
    notes: 'جاز کیش رسید #8841',
  },
  {
    id: 'pay-3',
    customer_id: 'a1000000-0000-0000-0000-000000000003',
    amount: 4000,
    payment_date: getTodayDateString(),
    payment_mode: 'ایزی پیسہ',
    notes: 'ایزی پیسہ اکاؤنٹ ٹرانسفر',
  },
  {
    id: 'pay-4',
    customer_id: 'a1000000-0000-0000-0000-000000000005',
    amount: 10000,
    payment_date: getTodayDateString(),
    payment_mode: 'بینک',
    notes: 'میزان بینک ٹرانسفر',
  }
];

interface DairyStore {
  customers: Customer[];
  dailyPickups: DailyPickup[];
  payments: Payment[];
  dailyCapacity: number;
  selectedDate: string;
  isLoading: boolean;
  isSyncing: boolean;
  isDemoMode: boolean;
  isInitialDataLoaded: boolean;

  // Actions
  fetchInitialData: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  setDailyCapacity: (capacity: number) => Promise<void>;
  
  // Pickups
  togglePickup: (customerId: string, customLiters?: number) => Promise<void>;
  updatePickupLiters: (customerId: string, liters: number) => Promise<void>;
  getPickupForCustomer: (customerId: string, dateStr?: string) => DailyPickup | undefined;
  
  // Payments
  recordPayment: (customerId: string, amount: number, mode: PaymentMode, notes?: string) => Promise<void>;
  
  // Customers
  addCustomer: (customer: Omit<Customer, 'id' | 'is_active' | 'created_at'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;

  // Aggregated calculations
  getCustomerLedger: (customerId: string, yearMonth?: string) => CustomerLedger | null;
  getAllLedgers: (yearMonth?: string) => CustomerLedger[];
  getDailyStats: (dateStr?: string) => {
    capacity: number;
    distributed: number;
    remaining: number;
    deliveredCount: number;
    totalCustomersCount: number;
  };
}

export const useDairyStore = create<DairyStore>((set, get) => ({
  customers: INITIAL_DEMO_CUSTOMERS,
  dailyPickups: generateDemoPickups(INITIAL_DEMO_CUSTOMERS),
  payments: INITIAL_DEMO_PAYMENTS,
  dailyCapacity: 65.0,
  selectedDate: getTodayDateString(),
  isLoading: false,
  isSyncing: false,
  isDemoMode: !isSupabaseConfigured(),
  isInitialDataLoaded: false,

  fetchInitialData: async () => {
    set({ isSyncing: true, isLoading: true });
    try {
      if (isSupabaseConfigured()) {
        let [customers, pickups, payments, settings] = await Promise.all([
          api.getCustomers(),
          api.getPickupsForMonth(getCurrentYearMonth()),
          api.getPayments(),
          api.getSettings(),
        ]);

        if (customers.length === 0) {
          // Attempt to seed initial demo customers into Supabase
          try {
            const seeded = await api.seedInitialCustomers(INITIAL_DEMO_CUSTOMERS);
            if (seeded && seeded.length > 0) {
              customers = seeded;
            }
          } catch (seedErr) {
            console.log('Auto-seed customers skipped:', seedErr);
          }
        }

        set({
          customers: customers.length > 0 ? customers : INITIAL_DEMO_CUSTOMERS,
          dailyPickups: pickups,
          payments: payments,
          dailyCapacity: settings?.default_capacity || 65.0,
          isDemoMode: false,
          isInitialDataLoaded: true,
        });
      } else {
        // Run with realistic seed data
        set({ isDemoMode: true, isInitialDataLoaded: true });
      }
    } catch (e) {
      console.warn('Could not sync with Supabase, running local offline store:', e);
      set({ isDemoMode: true, isInitialDataLoaded: true });
    } finally {
      set({ isSyncing: false, isLoading: false, isInitialDataLoaded: true });
    }
  },

  setSelectedDate: (date: string) => {
    set({ selectedDate: date });
  },

  setDailyCapacity: async (capacity: number) => {
    set({ dailyCapacity: capacity });
    if (isSupabaseConfigured() && !get().isDemoMode) {
      try {
        await api.updateCapacity(capacity);
      } catch (e) {
        console.error('Error updating capacity to Supabase:', e);
      }
    }
    triggerHaptic.medium();
  },

  getPickupForCustomer: (customerId: string, dateStr?: string) => {
    const targetDate = dateStr || get().selectedDate;
    return get().dailyPickups.find(
      p => p.customer_id === customerId && p.pickup_date === targetDate
    );
  },

  togglePickup: async (customerId: string, customLiters?: number) => {
    const { selectedDate, dailyPickups, customers } = get();
    const existingPickup = dailyPickups.find(
      p => p.customer_id === customerId && p.pickup_date === selectedDate
    );
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (existingPickup) {
      // Toggle off / cancel pickup
      triggerHaptic.selection();
      const updated = dailyPickups.filter(p => p.id !== existingPickup.id);
      set({ dailyPickups: updated });

      if (isSupabaseConfigured() && !get().isDemoMode && isUUID(customerId)) {
        try {
          await api.deletePickup(customerId, selectedDate);
        } catch (e) {
          console.error('Failed to delete pickup in Supabase:', e);
        }
      }
    } else {
      // Give milk (confirm pickup)
      triggerHaptic.success();
      const liters = customLiters ?? customer.default_liters;
      const rate = customer.price_per_liter;
      const totalAmount = liters * rate;
      const paymentStatus = customer.customer_type === 'spot' ? 'paid' : 'unpaid';

      const newPickup: DailyPickup = {
        id: `pickup-${customerId}-${selectedDate}-${Date.now()}`,
        customer_id: customerId,
        pickup_date: selectedDate,
        liters,
        rate,
        total_amount: totalAmount,
        payment_status: paymentStatus,
      };

      set({ dailyPickups: [newPickup, ...dailyPickups] });

      if (isSupabaseConfigured() && !get().isDemoMode && isUUID(customerId)) {
        try {
          const res = await api.upsertPickup({
            customer_id: customerId,
            pickup_date: selectedDate,
            liters,
            rate,
            payment_status: paymentStatus,
          });
          // Update id from db
          set({
            dailyPickups: get().dailyPickups.map(p =>
              p.id === newPickup.id ? res : p
            ),
          });
        } catch (e) {
          console.error('Failed to insert pickup in Supabase:', e);
        }
      }
    }
  },

  updatePickupLiters: async (customerId: string, liters: number) => {
    const { selectedDate, dailyPickups, customers } = get();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    const existingPickup = dailyPickups.find(
      p => p.customer_id === customerId && p.pickup_date === selectedDate
    );

    if (existingPickup) {
      const rate = customer.price_per_liter;
      const totalAmount = liters * rate;
      const updated = dailyPickups.map(p => {
        if (p.id === existingPickup.id) {
          return {
            ...p,
            liters,
            total_amount: totalAmount,
          };
        }
        return p;
      });
      set({ dailyPickups: updated });

      if (isSupabaseConfigured() && !get().isDemoMode && isUUID(customerId)) {
        try {
          await api.upsertPickup({
            customer_id: customerId,
            pickup_date: selectedDate,
            liters,
            rate,
            payment_status: existingPickup.payment_status,
          });
        } catch (e) {
          console.error('Failed to update pickup liters in Supabase:', e);
        }
      }
    }
  },

  recordPayment: async (customerId: string, amount: number, mode: PaymentMode, notes?: string) => {
    triggerHaptic.success();
    const today = getTodayDateString();
    const paymentId = generateUUID();
    const newPayment: Payment = {
      id: paymentId,
      customer_id: customerId,
      amount,
      payment_date: today,
      payment_mode: mode,
      notes,
    };

    set({ payments: [newPayment, ...get().payments] });

    if (isSupabaseConfigured() && !get().isDemoMode && isUUID(customerId)) {
      try {
        const saved = await api.addPayment({
          id: paymentId,
          customer_id: customerId,
          amount,
          payment_date: today,
          payment_mode: mode,
          notes,
        });
        set({
          payments: get().payments.map(p => p.id === newPayment.id ? saved : p)
        });
      } catch (e) {
        console.error('Failed to record payment in Supabase:', e);
      }
    }
  },

  addCustomer: async (customerData) => {
    triggerHaptic.success();
    const newId = generateUUID();
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      is_active: true,
    };

    set({ customers: [newCustomer, ...get().customers] });

    if (isSupabaseConfigured() && !get().isDemoMode) {
      try {
        const created = await api.addCustomer(newCustomer);
        set({
          customers: get().customers.map(c => c.id === newCustomer.id ? created : c)
        });
      } catch (e) {
        console.error('Failed to add customer in Supabase:', e);
      }
    }
  },

  updateCustomer: async (id: string, updates: Partial<Customer>) => {
    triggerHaptic.medium();
    set({
      customers: get().customers.map(c => (c.id === id ? { ...c, ...updates } : c)),
    });

    if (isSupabaseConfigured() && !get().isDemoMode && isUUID(id)) {
      try {
        await api.updateCustomer(id, updates);
      } catch (e) {
        console.error('Failed to update customer in Supabase:', e);
      }
    }
  },

  deleteCustomer: async (id: string) => {
    triggerHaptic.error();
    set({
      customers: get().customers.filter(c => c.id !== id),
    });

    if (isSupabaseConfigured() && !get().isDemoMode && isUUID(id)) {
      try {
        await api.deleteCustomer(id);
      } catch (e) {
        console.error('Failed to delete customer in Supabase:', e);
      }
    }
  },

  getCustomerLedger: (customerId: string, yearMonth?: string): CustomerLedger | null => {
    const { customers, dailyPickups, payments } = get();
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;

    const currentYM = yearMonth || getCurrentYearMonth();

    // Pickups for month
    const monthPickups = dailyPickups.filter(
      p => p.customer_id === customerId && p.pickup_date.startsWith(currentYM)
    );

    const current_month_liters = monthPickups.reduce((sum, p) => sum + Number(p.liters || 0), 0);
    const current_month_bill = monthPickups.reduce(
      (sum, p) => sum + Number(p.total_amount || (p.liters * p.rate) || 0),
      0
    );

    // All payments
    const custPayments = payments.filter(p => p.customer_id === customerId);
    const total_paid = custPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Net balance due is (all time bill - all time paid)
    const allPickups = dailyPickups.filter(p => p.customer_id === customerId);
    const allBill = allPickups.reduce(
      (sum, p) => sum + Number(p.total_amount || (p.liters * p.rate) || 0),
      0
    );
    const balance_due = allBill - total_paid;

    return {
      customer_id: customer.id,
      name: customer.name,
      phone: customer.phone,
      customer_type: customer.customer_type,
      default_liters: customer.default_liters,
      price_per_liter: customer.price_per_liter,
      current_month_liters,
      current_month_bill,
      total_paid,
      balance_due,
    };
  },

  getAllLedgers: (yearMonth?: string): CustomerLedger[] => {
    const { customers } = get();
    return customers
      .filter(c => c.is_active)
      .map(c => get().getCustomerLedger(c.id, yearMonth))
      .filter((l): l is CustomerLedger => l !== null);
  },

  getDailyStats: (dateStr?: string) => {
    const { dailyCapacity, dailyPickups, customers } = get();
    const targetDate = dateStr || get().selectedDate;

    const activeCustomers = customers.filter(c => c.is_active);
    const dayPickups = dailyPickups.filter(p => p.pickup_date === targetDate);

    const distributed = dayPickups.reduce((sum, p) => sum + Number(p.liters || 0), 0);
    const remaining = Math.max(0, dailyCapacity - distributed);

    return {
      capacity: dailyCapacity,
      distributed,
      remaining,
      deliveredCount: dayPickups.length,
      totalCustomersCount: activeCustomers.length,
    };
  },
}));
