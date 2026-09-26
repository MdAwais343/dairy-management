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

  let statusLabel = 'اسٹاک تسلی بخش ہے';
  let statusIcon: keyof typeof Ionicons.glyphMap = 'shield-checkmark';
  if (remaining <= 0) {
    statusLabel = 'اسٹاک مکمل تقسیم ہو چکا ہے';
    statusIcon = 'alert-circle';
  } else if (remaining <= 10) {
    statusLabel = 'توجہ: اسٹاک کم رہ گیا ہے';
    statusIcon = 'warning';
  }

  return (
    <View style={styles.container}>
      {/* Top Banner Row */}
      <View style={styles.topRow}>
        <View style={styles.counterBadge}>
          <Ionicons name="people" size={16} color={Colors.primary} />
          <UrduText size={12} weight="bold" color={Colors.primary} style={{ marginLeft: 6 }}>
            {deliveredCount} / {totalCustomersCount} گاہک فارغ
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
          <Ionicons name="create-outline" size={15} color={Colors.primary} />
          <UrduText size={12} weight="bold" color={Colors.primary} style={{ marginRight: 4 }}>
            {UrduStrings.daily.editCapacity}
          </UrduText>
        </TouchableOpacity>
      </View>

      {/* 3 Metric Cards */}
      <View style={styles.metricsGrid}>
        {/* Metric 1: کل گنجائش (Clickable to edit) */}
        <TouchableOpacity 
          style={[styles.metricCard, styles.capacityCard]} 
          onPress={() => {
            triggerHaptic.selection();
            onEditCapacityPress();
          }}
          activeOpacity={0.8}
        >
          <View style={styles.metricHeader}>
            <Ionicons name="cube" size={14} color={Colors.primary} />
            <UrduText size={11} weight="bold" color={Colors.primary} numberOfLines={1}>
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
          <UrduText size={10} color={Colors.textMuted} style={{ marginTop: 2 }}>
            (تبدیل کریں ✏️)
          </UrduText>
        </TouchableOpacity>

        {/* Metric 2: تقسیم شدہ */}
        <View style={[styles.metricCard, styles.distributedCard]}>
          <View style={styles.metricHeader}>
            <Ionicons name="checkmark-done-circle" size={15} color={Colors.successDark} />
            <UrduText size={11} weight="bold" color={Colors.successDark} numberOfLines={1}>
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
          <UrduText size={10} color={Colors.successDark} style={{ marginTop: 2 }}>
            ({percentageDistributed}% مکمل)
          </UrduText>
        </View>

        {/* Metric 3: باقی اسٹاک */}
        <View style={[styles.metricCard, { backgroundColor: remainingBg, borderColor: remainingColor, borderWidth: 1.5 }]}>
          <View style={styles.metricHeader}>
            <Ionicons name="water" size={15} color={remainingColor} />
            <UrduText size={11} weight="bold" color={remainingColor} numberOfLines={1}>
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
          <UrduText size={10} color={remainingColor} weight="medium" style={{ marginTop: 2 }}>
            دستیاب دودھ
          </UrduText>
        </View>
      </View>

      {/* Progress Bar & Status Pill */}
      <View style={styles.progressContainer}>
        <View style={styles.statusRow}>
          <View style={styles.statusIndicator}>
            <Ionicons name={statusIcon} size={13} color={remainingColor} />
            <UrduText size={11} weight="medium" color={remainingColor} style={{ marginRight: 4 }}>
              {statusLabel}
            </UrduText>
          </View>
          <UrduText size={11} weight="bold" color={Colors.primary}>
            {percentageDistributed}% تقسیم شدہ
          </UrduText>
        </View>

        <View style={styles.progressBarTrack}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${Math.min(100, Math.max(0, percentageDistributed))}%`,
                backgroundColor: percentageDistributed > 100 ? Colors.danger : (percentageDistributed >= 80 ? Colors.primary : Colors.success)
              }
            ]} 
          />
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
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  capacityCard: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  distributedCard: {
    backgroundColor: Colors.successSoft,
    borderColor: Colors.success,
    borderWidth: 1.5,
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
    marginTop: 12,
  },
  statusRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusIndicator: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
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
});
