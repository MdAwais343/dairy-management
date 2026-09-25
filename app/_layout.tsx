import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, I18nManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  NotoSansArabic_400Regular,
  NotoSansArabic_500Medium,
  NotoSansArabic_700Bold,
} from '@expo-google-fonts/noto-sans-arabic';
import { Colors } from '../constants/theme';
import { UrduText } from '../components/UrduText';
import { UrduStrings } from '../constants/urduStrings';
import { useDairyStore } from '../store/dairyStore';
import { useAuthStore } from '../store/authStore';
import { DairySplashScreen } from '../components/DairySplashScreen';

// Ensure RTL layout support
try {
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
  }
} catch (e) {
  console.log('I18nManager error:', e);
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  // 2-second minimum splash timer on every app startup
  const [isMinSplashTimeElapsed, setIsMinSplashTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinSplashTimeElapsed(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const [fontsLoaded] = useFonts({
    NotoSansArabic_400Regular,
    NotoSansArabic_500Medium,
    NotoSansArabic_700Bold,
  });

  const fetchInitialData = useDairyStore((state) => state.fetchInitialData);
  const initAuth = useAuthStore((state) => state.initAuth);
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const user = useAuthStore((state) => state.user);
  const isAuthLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    initAuth();
    fetchInitialData();
  }, []);

  const isAppReady = fontsLoaded && !isAuthLoading && isMinSplashTimeElapsed;

  // Auth & Onboarding Navigation Guard
  useEffect(() => {
    if (!isAppReady) return;

    const segmentsList = segments as string[];
    const inAuthGroup = segmentsList[0] === '(auth)';
    const inOnboarding = segmentsList.includes('onboarding');

    if (!isOnboarded) {
      // First time installation -> send to onboarding
      if (!inOnboarding) {
        router.replace('/onboarding');
      }
    } else if (!user) {
      // Onboarded but not logged in -> send to login
      if (!inAuthGroup) {
        router.replace('/login');
      }
    } else if (user && inAuthGroup) {
      // Already logged in -> send to dashboard
      router.replace('/(tabs)');
    }
  }, [isAppReady, isOnboarded, user, segments]);

  if (!isAppReady) {
    return <DairySplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, animation: 'none' }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="customer/[id]"
          options={{
            headerShown: true,
            presentation: 'modal',
            title: UrduStrings.customers.historyTitle,
            headerTintColor: Colors.primary,
            headerTitleStyle: {
              fontFamily: 'NotoSansArabic_700Bold',
              fontSize: 17,
            },
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
