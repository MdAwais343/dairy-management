import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { Customer, DailyPickup, Payment, DairySettings, DairyOwner, SignUpOwnerData } from '../types/database.types';

// Supabase credentials with production defaults to guarantee connectivity in all builds
const DEFAULT_SUPABASE_URL = 'https://ipjtxcihgnoxemjrkopj.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwanR4Y2loZ25veGVtanJrb3BqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAzNjI0MTcsImV4cCI6MjEwNTkzODQxN30.PHre8JYpbg9SDrZ6jYMKBY0fcF1AAi2mQUjKNJH6J5M';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

// Keep Supabase auth tokens fresh when app returns to foreground
if (supabase) {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase?.auth.startAutoRefresh();
    } else {
      supabase?.auth.stopAutoRefresh();
    }
  });
}

// =====================================================================
// Supabase Auth & Owner Profile Wrappers
// =====================================================================

export const authApi = {
  // Sign up owner with auth credentials and insert into dairy_owners table
  async signUpOwner(data: SignUpOwnerData): Promise<{ user: any; profile: DairyOwner }> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          owner_name: data.owner_name,
          farm_name: data.farm_name,
          phone: data.phone,
          default_capacity: data.default_capacity,
        }
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    const profile: DairyOwner = {
      id: authData.user.id,
      farm_name: data.farm_name,
      owner_name: data.owner_name,
      phone: data.phone,
      default_capacity: data.default_capacity,
    };

    // Insert into dairy_owners profile table
    try {
      const { error: profileError } = await supabase
        .from('dairy_owners')
        .upsert(profile);

      if (profileError) {
        console.warn('Profile table insert warning:', profileError);
      }
    } catch (e) {
      console.warn('Profile upsert exception:', e);
    }

    return { user: authData.user, profile };
  },

  // Sign in existing owner with email and password
  async signInOwner(email: string, password: string): Promise<{ user: any; profile: DairyOwner }> {
    if (!supabase) throw new Error('Supabase not configured');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('Login failed');

    // Fetch owner profile
    let profile = await this.getOwnerProfile(data.user.id);
    
    // If not found in table yet, build from user_metadata so real owner name is never lost
    if (!profile) {
      const meta = data.user.user_metadata || {};
      profile = {
        id: data.user.id,
        farm_name: meta.farm_name || 'ڈیری مینجمنٹ',
        owner_name: meta.owner_name || meta.full_name || email.split('@')[0] || 'فارم مالک',
        phone: meta.phone || '',
        default_capacity: Number(meta.default_capacity) || 50.0,
      };

      // Persist into table for future queries
      try {
        await supabase.from('dairy_owners').upsert(profile);
      } catch (upsertErr) {
        console.warn('Auto-upsert profile on login:', upsertErr);
      }
    }

    return { user: data.user, profile };
  },

  // Fetch dairy owner profile
  async getOwnerProfile(userId: string): Promise<DairyOwner | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('dairy_owners')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Error fetching owner profile:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.log('Exception in getOwnerProfile:', e);
      return null;
    }
  },

  // Update dairy owner profile
  async updateOwnerProfile(userId: string, updates: Partial<DairyOwner>): Promise<DairyOwner | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('dairy_owners')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating owner profile in Supabase:', error);
      throw error;
    }
    return data;
  },

  // Sign out current owner
  async signOutOwner(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  // Get current active session
  async getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
  }
};

// =====================================================================
// Supabase Data Access Wrappers
// =====================================================================

export const api = {
  // Fetch active customers
  async getCustomers(): Promise<Customer[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data || [];
  },

  // Seed initial customers if table is empty
  async seedInitialCustomers(customers: Customer[]): Promise<Customer[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('customers')
      .upsert(
        customers.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          default_liters: c.default_liters,
          price_per_liter: c.price_per_liter,
          customer_type: c.customer_type,
          is_active: c.is_active,
        })),
        { onConflict: 'id' }
      )
      .select();
    if (error) {
      console.warn('Could not seed initial customers:', error);
      return [];
    }
    return data || [];
  },

  // Add customer
  async addCustomer(customer: Omit<Customer, 'created_at' | 'id' | 'is_active'> & { id?: string; is_active?: boolean }): Promise<Customer> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('customers')
      .insert([customer])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Update customer
  async updateCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Soft delete customer
  async deleteCustomer(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', id);
    if (error) throw error;
  },

  // Get daily pickups for a specific date
  async getPickupsForDate(dateStr: string): Promise<DailyPickup[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('daily_pickups')
      .select('*')
      .eq('pickup_date', dateStr);
    if (error) throw error;
    return data || [];
  },

  // Get pickups for the current month
  async getPickupsForMonth(yearMonth: string): Promise<DailyPickup[]> {
    if (!supabase) return [];
    const [year, month] = yearMonth.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    const startDate = `${yearMonth}-01`;
    const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
    const { data, error } = await supabase
      .from('daily_pickups')
      .select('*')
      .gte('pickup_date', startDate)
      .lte('pickup_date', endDate);
    if (error) throw error;
    return data || [];
  },

  // Upsert daily pickup
  async upsertPickup(pickup: {
    customer_id: string;
    pickup_date: string;
    liters: number;
    rate: number;
    payment_status: 'paid' | 'unpaid';
  }): Promise<DailyPickup> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('daily_pickups')
      .upsert([pickup], { onConflict: 'customer_id,pickup_date' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete pickup (cancel takeaway)
  async deletePickup(customerId: string, dateStr: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not configured');
    const { error } = await supabase
      .from('daily_pickups')
      .delete()
      .eq('customer_id', customerId)
      .eq('pickup_date', dateStr);
    if (error) throw error;
  },

  // Get payments
  async getPayments(): Promise<Payment[]> {
    if (!supabase) return [];
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('payment_date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // Record payment
  async addPayment(payment: Omit<Payment, 'created_at' | 'id'> & { id?: string }): Promise<Payment> {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Get farm settings
  async getSettings(): Promise<DairySettings | null> {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('dairy_settings')
      .select('*')
      .eq('id', 'current_farm')
      .single();
    if (error) return null;
    return data;
  },

  // Update farm capacity
  async updateCapacity(capacity: number): Promise<void> {
    if (!supabase) return;
    await supabase
      .from('dairy_settings')
      .upsert({ id: 'current_farm', default_capacity: capacity, updated_at: new Date().toISOString() });
  }
};
