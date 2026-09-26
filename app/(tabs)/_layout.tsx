import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { UrduStrings } from '../../constants/urduStrings';
import { triggerHaptic } from '../../lib/haptics';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  // Lift the navbar comfortably above Android 3-button system bar (typically 48dp) or gesture bar (16-24dp)
  const bottomMargin = Math.max(insets.bottom, Platform.OS === 'android' ? 14 : 10) + 6;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#F8FAFC' },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomMargin,
          left: 16,
          right: 16,
          height: 66,
          backgroundColor: '#FFFFFF',
          borderRadius: 22,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: '#E2E8F0',
          paddingBottom: 6,
          paddingTop: 6,
          elevation: 12,
          shadowColor: '#1E3A8A',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'NotoSansArabic_700Bold',
          fontSize: 11,
          marginTop: -2,
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
            <View style={focused ? styles.activeIconPill : styles.inactiveIconPill}>
              <Ionicons
                name={focused ? 'water' : 'water-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 2: ماہانہ کھاتہ و بلنگ */}
      <Tabs.Screen
        name="billing"
        options={{
          title: UrduStrings.tabs.billing,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconPill : styles.inactiveIconPill}>
              <Ionicons
                name={focused ? 'receipt' : 'receipt-outline'}
                size={21}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 3: گاہک لسٹ */}
      <Tabs.Screen
        name="customers"
        options={{
          title: UrduStrings.tabs.customers,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconPill : styles.inactiveIconPill}>
              <Ionicons
                name={focused ? 'people' : 'people-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 4: فارم پروفائل */}
      <Tabs.Screen
        name="profile"
        options={{
          title: UrduStrings.tabs.profile,
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconPill : styles.inactiveIconPill}>
              <Ionicons
                name={focused ? 'person-circle' : 'person-circle-outline'}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activeIconPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveIconPill: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
