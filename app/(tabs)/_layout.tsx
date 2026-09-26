import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { UrduStrings } from '../../constants/urduStrings';
import { triggerHaptic } from '../../lib/haptics';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Bottom padding so icons & labels sit comfortably above Android 3-button bar or gesture pill
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 6);
  const barHeight = 58 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#F8FAFC' },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          height: barHeight,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontFamily: 'NotoSansArabic_700Bold',
          fontSize: 11.5,
          marginTop: 2,
        },
      }}
      screenListeners={{
        tabPress: () => {
          triggerHaptic.selection();
        },
      }}
    >
      {/* Tab 1: روزانہ کا ٹیک اوے */}
      <Tabs.Screen
        name="index"
        options={{
          title: UrduStrings.tabs.daily,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'water' : 'water-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 2: ماہانہ کھاتہ و بلنگ */}
      <Tabs.Screen
        name="billing"
        options={{
          title: UrduStrings.tabs.billing,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={23}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 3: گاہک لسٹ */}
      <Tabs.Screen
        name="customers"
        options={{
          title: UrduStrings.tabs.customers,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* Tab 4: فارم پروفائل */}
      <Tabs.Screen
        name="profile"
        options={{
          title: UrduStrings.tabs.profile,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
