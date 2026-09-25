import React from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function IndexScreen() {
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const user = useAuthStore((state) => state.user);

  if (!isOnboarded) {
    return <Redirect href="/onboarding" />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}

