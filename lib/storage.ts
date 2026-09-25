import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@dairy_onboarding_completed';
const DEMO_USER_KEY = '@dairy_demo_user_logged_in';
const OWNER_PROFILE_KEY = '@dairy_owner_profile';

export const storage = {
  async setOnboardingCompleted(completed: boolean = true): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
    } catch (e) {
      console.warn('Storage error setOnboardingCompleted:', e);
    }
  },

  async getOnboardingCompleted(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      return val ? JSON.parse(val) : false;
    } catch (e) {
      console.warn('Storage error getOnboardingCompleted:', e);
      return false;
    }
  },

  async setDemoUser(user: any): Promise<void> {
    try {
      if (user) {
        await AsyncStorage.setItem(DEMO_USER_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(DEMO_USER_KEY);
      }
    } catch (e) {
      console.warn('Storage error setDemoUser:', e);
    }
  },

  async getDemoUser(): Promise<any | null> {
    try {
      const val = await AsyncStorage.getItem(DEMO_USER_KEY);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.warn('Storage error getDemoUser:', e);
      return null;
    }
  },

  async setOwnerProfile(profile: any): Promise<void> {
    try {
      if (profile) {
        await AsyncStorage.setItem(OWNER_PROFILE_KEY, JSON.stringify(profile));
      } else {
        await AsyncStorage.removeItem(OWNER_PROFILE_KEY);
      }
    } catch (e) {
      console.warn('Storage error setOwnerProfile:', e);
    }
  },

  async getOwnerProfile(): Promise<any | null> {
    try {
      const val = await AsyncStorage.getItem(OWNER_PROFILE_KEY);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      console.warn('Storage error getOwnerProfile:', e);
      return null;
    }
  },

  async clearAllAuth(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(DEMO_USER_KEY),
        AsyncStorage.removeItem(OWNER_PROFILE_KEY),
      ]);
    } catch (e) {
      console.warn('Storage error clearAllAuth:', e);
    }
  },
};
