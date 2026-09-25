import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { UrduStrings } from '../constants/urduStrings';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../lib/haptics';

interface DailyStatsBarProps {
  capacity: number;
  distributed: number;
  remaining: number;
  deliveredCount: number;
  totalCustomersCount: number;
  onEditCapacityPress: () => void;
}

export const DailyStatsBar: React.FC<DailyStatsBarProps> = ({
  capacity,
  distributed,
  remaining,
  deliveredCount,
  totalCustomersCount,
  onEditCapacityPress,
}) => {
  const percentageDistributed = Math.min(100, Math.round((distributed / (capacity || 1)) * 100));

  // Determine remaining stock color
  let remainingColor = Colors.primary;
  let remainingBg = Colors.milkTint;
  if (remaining <= 5) {
    remainingColor = Colors.danger;
    remainingBg = Colors.dangerSoft;
  } else if (remaining <= 15) {
    remainingColor = Colors.warning;
    remainingBg = Colors.warningSoft;
  } else {
    remainingColor = Colors.successDark;
    remainingBg = Colors.successSoft;
  }

  return (
    <View style={styles.container}>
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.counterBadge}>
          <Ionicons name="people" size={16} color={Colors.primary} />
          <UrduText size={12} weight="medium" color={Colors.primary} style={{ marginLeft: 6 }}>
            {deliveredCount} / {totalCustomersCount} گاہک
          </UrduText>
        </View>

        <TouchableOpacity 
          style={styles.capacityEditBtn}
          onPress={() => {
            triggerHaptic.selection();
            onEditCapacityPress();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={15} color={Colors.textMuted} />
          <UrduText size={12} weight="medium" color={Colors.textMuted} style={{ marginRight: 4 }}>
            {UrduStrings.daily.editCapacity}
          </UrduText>
        </TouchableOpacity>
      </View>

      {/* 3 Metric Cards */}
      <View style={styles.metricsGrid}>
        {/* Metric 1: کل گنجائش */}
        <View style={[styles.metricCard, { backgroundColor: '#F1F5F9' }]}>
          <View style={styles.metricHeader}>
            <Ionicons name="cube-outline" size={14} color={Colors.textMuted} />
            <UrduText size={11} weight="medium" color={Colors.textMuted} numberOfLines={1}>
              {UrduStrings.daily.capacity}
            </UrduText>
          </View>
          <View style={styles.valueRow}>
            <UrduText size={18} weight="bold" color={Colors.textDark}>
              {capacity.toFixed(1)}
            </UrduText>
            <UrduText size={11} weight="medium" color={Colors.textMuted} style={styles.unitText}>
              {UrduStrings.daily.litersUnit}
            </UrduText>
          </View>
        </View>

        {/* Metric 2: تقسیم شدہ */}
        <View style={[styles.metricCard, { backgroundColor: Colors.successSoft, borderColor: Colors.success, borderWidth: 1 }]}>
          <View style={styles.metricHeader}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.successDark} />
            <UrduText size={11} weight="medium" color={Colors.successDark} numberOfLines={1}>
              {UrduStrings.daily.distributed}
            </UrduText>
          </View>
          <View style={styles.valueRow}>
            <UrduText size={18} weight="bold" color={Colors.successDark}>
              {distributed.toFixed(1)}
            </UrduText>
            <UrduText size={11} weight="medium" color={Colors.successDark} style={styles.unitText}>
              {UrduStrings.daily.litersUnit}
            </UrduText>
          </View>
        </View>

        {/* Metric 3: باقی اسٹاک */}
        <View style={[styles.metricCard, { backgroundColor: remainingBg, borderColor: remainingColor, borderWidth: 1 }]}>
          <View style={styles.metricHeader}>
            <Ionicons name="water-outline" size={14} color={remainingColor} />
            <UrduText size={11} weight="medium" color={remainingColor} numberOfLines={1}>
              {UrduStrings.daily.remaining}
            </UrduText>
          </View>
          <View style={styles.valueRow}>
            <UrduText size={18} weight="bold" color={remainingColor}>
              {remaining.toFixed(1)}
            </UrduText>
            <UrduText size={11} weight="medium" color={remainingColor} style={styles.unitText}>
              {UrduStrings.daily.litersUnit}
            </UrduText>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarTrack}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${percentageDistributed}%`,
                backgroundColor: percentageDistributed > 100 ? Colors.danger : Colors.success
              }
            ]} 
          />
        </View>
        <View style={styles.progressLabels}>
          <UrduText size={11} color={Colors.textMuted}>
            0 {UrduStrings.daily.litersUnit}
          </UrduText>
          <UrduText size={11} weight="medium" color={Colors.primary}>
            {percentageDistributed}% تقسیم مکمل
          </UrduText>
          <UrduText size={11} color={Colors.textMuted}>
            {capacity.toFixed(0)} {UrduStrings.daily.litersUnit}
          </UrduText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 16,
  },
  capacityEditBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  metricsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    gap: 6,
  },
  metricCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 2,
  },
  unitText: {
    marginLeft: 3,
  },
  progressContainer: {
    marginTop: 14,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 6,
  }
});
