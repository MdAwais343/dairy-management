import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { UrduText } from '../../components/UrduText';
import { OnboardingSlide, SlideData } from '../../components/OnboardingSlide';
import { useAuthStore } from '../../store/authStore';
import { triggerHaptic } from '../../lib/haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES: SlideData[] = [
  {
    id: '1',
    scene: 'pasture',
    badgeText: '🐄 تازہ و خالص دودھ کی نکاسی',
    title: 'فارم سے روزانہ دودھ کی نکاسی اور کوٹہ مینجمنٹ',
    description:
      'گاہکوں کے معمول کے مطابق موقع پر دودھ کی مقدار ایڈجسٹ کریں، قیمت کا فوری حساب دیکھیں اور ایک ٹیپ سے فراہمی کنفرم کریں۔',
    color: '#1E3A8A',
    bgTint: '#E0F2FE',
  },
  {
    id: '2',
    scene: 'khata',
    badgeText: '📋 ڈیجیٹل کسٹمر کھاتہ',
    title: 'ادھار اور نقد گاہکوں کا شفاف اور بے عیب کھاتہ',
    description:
      'مہینے کے اختتام پر بغیر کسی پریشانی کے ہر گاہک کا صاف حساب کتاب، وصول شدہ ادائیگیاں اور خالص بقایا بیلنس حاصل کریں۔',
    color: '#059669',
    bgTint: '#D1FAE5',
  },
  {
    id: '3',
    scene: 'delivery',
    badgeText: '📲 خودکار واٹس ایپ رسید',
    title: 'تاریخ وار تفصیلی بل واٹس ایپ پر ارسال کریں',
    description:
      'ہر گاہک کو تاریخ، لیٹر اور قیمت کے ساتھ خوبصورت اردو میں خودکار تفصیلی بل بھیجیں اور ادائیگیاں باآسانی وصول کریں۔',
    color: '#16A34A',
    bgTint: '#DCFCE7',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
      triggerHaptic.selection();
    }
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
      triggerHaptic.selection();
    } else {
      triggerHaptic.success();
      await completeOnboarding();
      router.replace('/login');
    }
  };

  const handleSkip = async () => {
    triggerHaptic.medium();
    await completeOnboarding();
    router.replace('/login');
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Soft Ambient Rural Sky & Pasture Backdrops */}
      <View style={styles.ambientSky} />
      <View style={styles.ambientHill} />

      {/* Top Header: Farm Name & Skip Button */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton} activeOpacity={0.7}>
          <UrduText size={14} weight="medium" color={Colors.textMuted}>
            چھوڑیں (Skip)
          </UrduText>
        </TouchableOpacity>

        <View style={styles.brandBadge}>
          <MaterialCommunityIcons name="cow" size={20} color={Colors.primary} style={{ marginLeft: 6 }} />
          <UrduText size={15} weight="bold" color={Colors.primary}>
            ڈیری مینجمنٹ
          </UrduText>
        </View>
      </View>

      {/* Main Slides FlatList */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        renderItem={({ item, index }) => (
          <OnboardingSlide slide={item} isActive={index === currentIndex} />
        )}
        contentContainerStyle={styles.slidesList}
      />

      {/* Bottom Footer: Pagination Dots & Action Button */}
      <View style={styles.footerContainer}>
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {SLIDES.map((_, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isActive ? styles.dotActive : styles.dotInactive,
                  isActive && { backgroundColor: SLIDES[currentIndex].color },
                ]}
              />
            );
          })}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: SLIDES[currentIndex].color },
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isLastSlide ? 'checkmark-circle' : 'arrow-back'}
            size={20}
            color="#FFFFFF"
            style={{ marginLeft: 6 }}
          />
          <UrduText size={16} weight="bold" color="#FFFFFF">
            {isLastSlide ? 'ابھی شروع کریں' : 'اگلا قدم'}
          </UrduText>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientSky: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: SCREEN_WIDTH * 1.3,
    height: 240,
    borderRadius: SCREEN_WIDTH * 0.65,
    backgroundColor: '#E0F2FE',
    opacity: 0.6,
  },
  ambientHill: {
    position: 'absolute',
    bottom: -80,
    left: -50,
    width: SCREEN_WIDTH * 1.4,
    height: 220,
    borderRadius: SCREEN_WIDTH * 0.7,
    backgroundColor: '#ECFDF5',
    opacity: 0.7,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  brandBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  slidesList: {
    alignItems: 'center',
  },
  footerContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  actionButton: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});
