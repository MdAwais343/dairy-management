import { create } from 'zustand';
import { DairyOwner, SignUpOwnerData } from '../types/database.types';
import { authApi, isSupabaseConfigured, supabase } from '../lib/supabase';
import { storage } from '../lib/storage';
import { triggerHaptic } from '../lib/haptics';
import { useDairyStore } from './dairyStore';

interface AuthState {
  isOnboarded: boolean;
  user: any | null;
  ownerProfile: DairyOwner | null;
  isInitialLoading: boolean;
  isLoading: boolean;
  isDemoLogin: boolean;

  // Actions
  initAuth: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: SignUpOwnerData) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateOwnerProfile: (updates: Partial<DairyOwner>) => Promise<void>;
}

const DEFAULT_DEMO_OWNER: DairyOwner = {
  id: 'demo-owner-101',
  farm_name: 'ڈیری مینجمنٹ',
  owner_name: 'چوہدری عابد حسین',
  phone: '03001234567',
  default_capacity: 65.0,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isOnboarded: false,
  user: null,
  ownerProfile: null,
  isInitialLoading: true,
  isLoading: false,
  isDemoLogin: false,

  initAuth: async () => {
    try {
      set({ isInitialLoading: true });
      const onboarded = await storage.getOnboardingCompleted();

      // 1. Check live Supabase session FIRST (live user session takes strict priority)
      if (isSupabaseConfigured() && supabase) {
        const session = await authApi.getSession();
        if (session?.user) {
          const profile = await authApi.getOwnerProfile(session.user.id);
          await storage.setDemoUser(null);
          if (profile) {
            await storage.setOwnerProfile(profile);
          }
          set({
            isOnboarded: onboarded,
            user: session.user,
            ownerProfile: profile,
            isDemoLogin: false,
            isInitialLoading: false,
            isLoading: false,
          });
          return;
        }
      }

      // 2. Only if no live Supabase session, check for local demo user
      const savedDemoUser = await storage.getDemoUser();
      const savedProfile = await storage.getOwnerProfile();

      if (savedDemoUser) {
        set({
          isOnboarded: onboarded,
          user: savedDemoUser,
          ownerProfile: savedProfile || DEFAULT_DEMO_OWNER,
          isDemoLogin: true,
          isInitialLoading: false,
          isLoading: false,
        });
        return;
      }

      set({
        isOnboarded: onboarded,
        user: null,
        ownerProfile: null,
        isDemoLogin: false,
        isInitialLoading: false,
        isLoading: false,
      });
    } catch (e) {
      console.warn('Error during initAuth:', e);
      set({ isInitialLoading: false, isLoading: false });
    }
  },

  completeOnboarding: async () => {
    triggerHaptic.medium();
    await storage.setOnboardingCompleted(true);
    set({ isOnboarded: true });
  },

  login: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured()) {
        const { user, profile } = await authApi.signInOwner(email, pass);
        // Clear demo flags from persistent storage
        await storage.setDemoUser(null);
        await storage.setOwnerProfile(profile);
        triggerHaptic.success();
        set({
          user,
          ownerProfile: profile,
          isDemoLogin: false,
          isLoading: false,
        });
        // Immediately fetch live cloud data for the logged-in owner
        useDairyStore.getState().fetchInitialData();
      } else {
        // Fallback demo login if supabase keys not configured
        await get().demoLogin();
      }
    } catch (error) {
      set({ isLoading: false });
      triggerHaptic.error();
      throw error;
    }
  },

  signup: async (data: SignUpOwnerData) => {
    set({ isLoading: true });
    try {
      if (isSupabaseConfigured()) {
        const { user, profile } = await authApi.signUpOwner(data);
        await storage.setDemoUser(null);
        await storage.setOwnerProfile(profile);
        triggerHaptic.success();
        set({
          user,
          ownerProfile: profile,
          isDemoLogin: false,
          isLoading: false,
        });
        // Immediately fetch live cloud data for the newly registered owner
        useDairyStore.getState().fetchInitialData();
      } else {
        // Demo signup
        const profile: DairyOwner = {
          id: `demo-owner-${Date.now()}`,
          farm_name: data.farm_name,
          owner_name: data.owner_name,
          phone: data.phone,
          default_capacity: data.default_capacity,
        };
        const demoUser = {
          id: profile.id,
          email: data.email,
        };
        await storage.setDemoUser(demoUser);
        await storage.setOwnerProfile(profile);
        triggerHaptic.success();
        set({
          user: demoUser,
          ownerProfile: profile,
          isDemoLogin: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      triggerHaptic.error();
      throw error;
    }
  },

  demoLogin: async () => {
    triggerHaptic.success();
    const demoUser = {
      id: DEFAULT_DEMO_OWNER.id,
      email: 'owner@dairymanagement.pk',
    };
    await storage.setDemoUser(demoUser);
    await storage.setOwnerProfile(DEFAULT_DEMO_OWNER);
    set({
      user: demoUser,
      ownerProfile: DEFAULT_DEMO_OWNER,
      isDemoLogin: true,
      isLoading: false,
    });
  },

  logout: async () => {
    triggerHaptic.medium();
    if (isSupabaseConfigured()) {
      await authApi.signOutOwner();
    }
    await storage.clearAllAuth();
    set({
      user: null,
      ownerProfile: null,
      isDemoLogin: false,
    });
  },

  updateOwnerProfile: async (updates: Partial<DairyOwner>) => {
    triggerHaptic.medium();
    const current = get().ownerProfile || DEFAULT_DEMO_OWNER;
    const updated: DairyOwner = { ...current, ...updates };

    set({ ownerProfile: updated });
    await storage.setOwnerProfile(updated);

    if (isSupabaseConfigured() && !get().isDemoLogin && get().user?.id) {
      try {
        await authApi.updateOwnerProfile(get().user.id, updates);
      } catch (e) {
        console.error('Failed to update owner profile in Supabase:', e);
      }
    }
  },
}));
