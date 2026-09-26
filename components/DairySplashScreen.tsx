import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Animated, ActivityIndicator, Image } from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { DairyFarmIllustration } from './DairyFarmIllustration';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const DairySplashScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const imageCardWidth = Math.min(SCREEN_WIDTH - 48, 280);
  const imageCardHeight = Math.min(SCREEN_HEIGHT * 0.38, 280);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 8, 28),
          paddingBottom: Math.max(insets.bottom + 8, 28),
        },
      ]}
    >
      {/* Background Decorative Rural Ambient Shapes */}
      <View style={styles.topSkyAura} />
      <View style={styles.bottomPastureHill} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Top Farm Brand Badge */}
        <View style={styles.badgeRow}>
          <View style={styles.leafPill}>
            <Ionicons name="leaf" size={14} color="#059669" style={{ marginLeft: 5 }} />
            <UrduText size={12} weight="bold" color="#059669">
              اصلی و خالص فارم ڈیری
            </UrduText>
          </View>
        </View>

        {/* Dairy Animal & Farm Centerpiece */}
        <View style={styles.illustrationWrapper}>
          {!imageError ? (
            <View
              style={[
                styles.imageCard,
                { width: imageCardWidth, height: imageCardHeight },
              ]}
            >
              <Image
                source={require('../assets/splash.png')}
                style={styles.splashImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            </View>
          ) : (
            <DairyFarmIllustration scene="splash" size={210} animated={true} />
          )}
        </View>

        {/* Main App Title & Tagline in Urdu */}
        <View style={styles.textBlock}>
          <UrduText size={24} weight="bold" color="#1E3A8A" align="center" style={styles.mainTitle}>
            ڈیری مینجمنٹ
          </UrduText>

          <UrduText size={12.5} weight="medium" color="#047857" align="center" style={styles.subtitle}>
            روزانہ دودھ کی نکاسی • ڈیجیٹل کھاتہ • واٹس ایپ بل
          </UrduText>
        </View>

        {/* Modern Farm Loading State Card */}
        <View style={styles.loadingCard}>
          <ActivityIndicator size="small" color="#059669" />
          <UrduText size={12} weight="medium" color="#334155" style={{ marginRight: 10 }}>
            فارم اور گاہکوں کا ریکارڈ لوڈ ہو رہا ہے...
          </UrduText>
        </View>
      </Animated.View>

      {/* Bottom Footer Note */}
      <View style={styles.footerNote}>
        <MaterialCommunityIcons name="shield-check" size={15} color="#64748B" style={{ marginLeft: 4 }} />
        <UrduText size={11} color="#64748B">
          ڈیری فارم کے لیے محفوظ اور آف لائن سپورٹڈ ایپ
        </UrduText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 36,
  },
  topSkyAura: {
    position: 'absolute',
    top: -80,
    width: SCREEN_WIDTH * 1.4,
    height: 320,
    borderRadius: SCREEN_WIDTH * 0.7,
    backgroundColor: '#E0F2FE', // Rural sunny morning sky
    opacity: 0.7,
  },
  bottomPastureHill: {
    position: 'absolute',
    bottom: -90,
    width: SCREEN_WIDTH * 1.5,
    height: 250,
    borderRadius: SCREEN_WIDTH * 0.75,
    backgroundColor: '#ECFDF5', // Soft pasture green floor
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  badgeRow: {
    marginBottom: 16,
  },
  leafPill: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  illustrationWrapper: {
    marginVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 8,
    shadowColor: '#064E3B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    backgroundColor: '#ECFDF5',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
  textBlock: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 18,
    paddingHorizontal: 16,
  },
  mainTitle: {
    marginBottom: 4,
    textAlign: 'center',
    alignSelf: 'center',
  },
  subtitle: {
    opacity: 0.92,
    textAlign: 'center',
    alignSelf: 'center',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  loadingCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  footerNote: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    zIndex: 10,
  },
});
