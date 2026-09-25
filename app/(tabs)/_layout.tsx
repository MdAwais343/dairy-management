import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { UrduStrings } from '../../constants/urduStrings';
import { triggerHaptic } from '../../lib/haptics';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontFamily: 'NotoSansArabic_500Medium',
          fontSize: 12,
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
              size={24}
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
