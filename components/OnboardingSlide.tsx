import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { DairyFarmIllustration, IllustrationScene } from './DairyFarmIllustration';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SlideData {
  id: string;
  scene: IllustrationScene;
  badgeText: string;
  title: string;
  description: string;
  color: string;
  bgTint: string;
}

interface OnboardingSlideProps {
  slide: SlideData;
  isActive: boolean;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({ slide, isActive }) => {
  return (
    <View style={[styles.container, { width: SCREEN_WIDTH }]}>
      {/* Decorative Rural Dairy Art Showcase */}
      <View style={styles.artContainer}>
        {/* Soft Background Pasture Tint */}
        <View style={[styles.haloBackground, { backgroundColor: slide.bgTint }]} />

        {/* Dairy Animal & Farm Illustration */}
        <DairyFarmIllustration
          scene={slide.scene}
          size={200}
          animated={isActive}
        />

        {/* Floating pill badge */}
        <View style={styles.floatingBadge}>
          <UrduText size={12} weight="bold" color={slide.color}>
            {slide.badgeText}
          </UrduText>
        </View>
      </View>

      {/* Slide Text Content */}
      <View style={styles.contentContainer}>
        <UrduText size={22} weight="bold" color={Colors.textDark} align="center" style={styles.title}>
          {slide.title}
        </UrduText>

        <UrduText
          size={14}
          color={Colors.textMedium}
          align="center"
          style={styles.description}
        >
          {slide.description}
        </UrduText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  artContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  haloBackground: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    opacity: 0.6,
  },
  floatingBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    zIndex: 20,
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    paddingHorizontal: 10,
  },
  title: {
    marginBottom: 10,
    lineHeight: 32,
  },
  description: {
    lineHeight: 23,
    opacity: 0.9,
  },
});
