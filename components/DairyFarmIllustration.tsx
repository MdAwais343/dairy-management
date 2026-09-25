import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '../constants/theme';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { UrduText } from './UrduText';

export type IllustrationScene = 'splash' | 'pasture' | 'khata' | 'delivery' | 'emblem';

interface DairyFarmIllustrationProps {
  scene?: IllustrationScene;
  size?: number;
  animated?: boolean;
}

export const DairyFarmIllustration: React.FC<DairyFarmIllustrationProps> = ({
  scene = 'pasture',
  size = 220,
  animated = true,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sunRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animated) return;

    // Gentle floating breathing animation
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 6,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle scale breathing
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Slow sun rotation
    const sunLoop = Animated.loop(
      Animated.timing(sunRotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    floatLoop.start();
    pulseLoop.start();
    sunLoop.start();

    return () => {
      floatLoop.stop();
      pulseLoop.stop();
      sunLoop.stop();
    };
  }, [animated]);

  const sunSpin = sunRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scale = size / 220;

  // Render Emblem Mode (for headers, cards, login badge)
  if (scene === 'emblem') {
    return (
      <View style={[styles.emblemContainer, { width: size, height: size }]}>
        <View style={styles.emblemCircle}>
          <MaterialCommunityIcons name="cow" size={size * 0.58} color="#1E3A8A" />
          <View style={styles.emblemMilkBadge}>
            <Ionicons name="water" size={size * 0.24} color="#059669" />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* 1. Sky & Meadow Circular Atmosphere */}
      <View style={[styles.landscapeCircle, { width: size, height: size, borderRadius: size / 2 }]}>
        {/* Soft Sunny Sky Background */}
        <View style={styles.skyBackground} />

        {/* Golden Sun with slow ambient rotation */}
        <Animated.View
          style={[
            styles.sunWrapper,
            {
              top: 14 * scale,
              right: 24 * scale,
              transform: [{ rotate: sunSpin }],
            },
          ]}
        >
          <Ionicons name="sunny" size={32 * scale} color="#F59E0B" />
        </Animated.View>

        {/* Fluffy Rural White Cloud */}
        <View style={[styles.cloudWrapper, { top: 22 * scale, left: 18 * scale }]}>
          <Ionicons name="cloud" size={28 * scale} color="#FFFFFF" style={{ opacity: 0.9 }} />
        </View>

        {/* Background Rolling Pasture Hill (Darker Emerald) */}
        <View
          style={[
            styles.hillBack,
            {
              bottom: -15 * scale,
              left: -30 * scale,
              width: size * 1.3,
              height: size * 0.55,
              borderRadius: size * 0.6,
            },
          ]}
        >
          {/* Small companion calf / cow grazing on distant hill */}
          <View style={[styles.distantCalf, { top: 12 * scale, right: 50 * scale }]}>
            <MaterialCommunityIcons name="cow" size={18 * scale} color="#047857" />
          </View>
        </View>

        {/* Foreground Lush Pasture Hill (Vibrant Fresh Green) */}
        <View
          style={[
            styles.hillFront,
            {
              bottom: -25 * scale,
              right: -35 * scale,
              width: size * 1.35,
              height: size * 0.55,
              borderRadius: size * 0.65,
            },
          ]}
        >
          {/* Pasture grass tufts */}
          <View style={[styles.grassTuft, { left: 45 * scale, top: 12 * scale }]}>
            <MaterialCommunityIcons name="grass" size={16 * scale} color="#34D399" />
          </View>
          <View style={[styles.grassTuft, { right: 45 * scale, top: 8 * scale }]}>
            <MaterialCommunityIcons name="grass" size={18 * scale} color="#34D399" />
          </View>
        </View>

        {/* 2. Main Animal: Dairy Cow (گائے / بھینس) */}
        <Animated.View
          style={[
            styles.cowContainer,
            {
              transform: [
                { translateY: floatAnim },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          {/* Cow Silhouette with Crisp Contrast */}
          <View style={styles.cowWrapper}>
            <MaterialCommunityIcons
              name="cow"
              size={76 * scale}
              color="#0F172A"
              style={styles.cowIcon}
            />

            {/* Farm Cow Bell / Leaf Collar Tag */}
            <View style={[styles.cowBellBadge, { bottom: 12 * scale, left: 16 * scale }]}>
              <Ionicons name="leaf" size={11 * scale} color="#059669" />
            </View>
          </View>

          {/* Scene Specific Foreground Props */}
          {scene === 'pasture' || scene === 'splash' ? (
            /* Stainless Steel Milk Pail / Cans */
            <View style={[styles.milkPailWrapper, { bottom: 4 * scale, right: -12 * scale }]}>
              <View style={styles.pailCircle}>
                <MaterialCommunityIcons name="pail" size={24 * scale} color="#1E3A8A" />
              </View>
              {/* Splashing pure milk drop */}
              <View style={[styles.milkDropPill, { top: -8 * scale, right: 6 * scale }]}>
                <Ionicons name="water" size={14 * scale} color="#38BDF8" />
              </View>
            </View>
          ) : scene === 'khata' ? (
            /* Digital Ledger Badge with checkmark and coin */
            <View style={[styles.milkPailWrapper, { bottom: 6 * scale, right: -14 * scale }]}>
              <View style={[styles.pailCircle, { backgroundColor: '#ECFDF5', borderColor: '#059669' }]}>
                <Ionicons name="receipt" size={22 * scale} color="#059669" />
              </View>
              <View style={[styles.milkDropPill, { top: -6 * scale, right: -4 * scale, backgroundColor: '#FEF3C7' }]}>
                <FontAwesome5 name="check" size={10 * scale} color="#059669" />
              </View>
            </View>
          ) : (
            /* WhatsApp Invoice Badge */
            <View style={[styles.milkPailWrapper, { bottom: 6 * scale, right: -14 * scale }]}>
              <View style={[styles.pailCircle, { backgroundColor: '#DCFCE7', borderColor: '#16A34A' }]}>
                <Ionicons name="logo-whatsapp" size={22 * scale} color="#16A34A" />
              </View>
            </View>
          )}
        </Animated.View>
      </View>

      {/* Outer Decorative Ring */}
      <View
        style={[
          styles.outerRing,
          {
            width: size + 16 * scale,
            height: size + 16 * scale,
            borderRadius: (size + 16 * scale) / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  landscapeCircle: {
    overflow: 'hidden',
    backgroundColor: '#E0F2FE', // Rural sunny morning sky
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#E0F2FE',
  },
  sunWrapper: {
    position: 'absolute',
  },
  cloudWrapper: {
    position: 'absolute',
  },
  hillBack: {
    position: 'absolute',
    backgroundColor: '#059669', // Emerald hill
    transform: [{ rotate: '-8deg' }],
  },
  distantCalf: {
    position: 'absolute',
    opacity: 0.6,
  },
  hillFront: {
    position: 'absolute',
    backgroundColor: '#10B981', // Bright pasture green
    transform: [{ rotate: '6deg' }],
  },
  grassTuft: {
    position: 'absolute',
  },
  cowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 10,
    marginTop: 10,
  },
  cowWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cowIcon: {
    // Subtle shadow for 3D realism
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  cowBellBadge: {
    position: 'absolute',
    backgroundColor: '#DCFCE7',
    padding: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  milkPailWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pailCircle: {
    backgroundColor: '#F0F9FF',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#38BDF8',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  milkDropPill: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 2,
    borderRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  outerRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#A7F3D0',
    borderStyle: 'dashed',
    opacity: 0.7,
    pointerEvents: 'none',
  },
  emblemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emblemCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
    borderWidth: 3,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  emblemMilkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 2,
    borderWidth: 1.5,
    borderColor: '#10B981',
  },
});
