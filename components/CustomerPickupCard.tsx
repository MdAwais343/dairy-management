import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { UrduStrings } from '../constants/urduStrings';
import { Customer, DailyPickup } from '../types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../lib/haptics';

interface CustomerPickupCardProps {
  customer: Customer;
  pickup?: DailyPickup;
  onTogglePickup: (customerId: string, customLiters: number) => void;
  onUpdateLiters: (customerId: string, liters: number) => void;
}

export const CustomerPickupCard: React.FC<CustomerPickupCardProps> = ({
  customer,
  pickup,
  onTogglePickup,
  onUpdateLiters,
}) => {
  const isDelivered = Boolean(pickup);
  const [liters, setLiters] = useState<number>(pickup?.liters || customer.default_liters);

  // Sync state if pickup changes
  useEffect(() => {
    if (pickup) {
      setLiters(pickup.liters);
    } else {
      setLiters(customer.default_liters);
    }
  }, [pickup, customer.default_liters]);

  const currentRate = customer.price_per_liter;
  const totalPrice = Math.round(liters * currentRate);
  const initialChar = customer.name.trim().charAt(0) || 'گ';

  const handleDecrease = () => {
    if (liters <= 0.5) return;
    const newLiters = Number((liters - 0.5).toFixed(1));
    setLiters(newLiters);
    triggerHaptic.selection();
    if (isDelivered) {
      onUpdateLiters(customer.id, newLiters);
    }
  };

  const handleIncrease = () => {
    if (liters >= 30) return;
    const newLiters = Number((liters + 0.5).toFixed(1));
    setLiters(newLiters);
    triggerHaptic.selection();
    if (isDelivered) {
      onUpdateLiters(customer.id, newLiters);
    }
  };

  const handleAddQuick = (amount: number) => {
    triggerHaptic.selection();
    const newLiters = Number((liters + amount).toFixed(1));
    setLiters(newLiters);
    if (isDelivered) {
      onUpdateLiters(customer.id, newLiters);
    }
  };

  const handleResetToDefault = () => {
    triggerHaptic.selection();
    setLiters(customer.default_liters);
    if (isDelivered) {
      onUpdateLiters(customer.id, customer.default_liters);
    }
  };

  const handleCall = () => {
    triggerHaptic.selection();
    if (customer.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleToggle = () => {
    triggerHaptic.medium();
    onTogglePickup(customer.id, liters);
  };

  return (
    <View 
      style={[
        styles.card,
        isDelivered ? styles.cardDelivered : styles.cardPending
      ]}
    >
      {/* Header Row: Customer Initial Avatar, Name, Phone & Quick Call */}
      <View style={styles.headerRow}>
        <View style={styles.avatarAndName}>
          <View style={[styles.avatar, isDelivered ? styles.avatarDelivered : styles.avatarPending]}>
            {isDelivered ? (
              <Ionicons name="checkmark-sharp" size={18} color="#FFFFFF" />
            ) : (
              <UrduText size={16} weight="bold" color="#FFFFFF">
                {initialChar}
              </UrduText>
            )}
          </View>
          <View style={styles.nameBlock}>
            <UrduText size={17} weight="bold" color={isDelivered ? Colors.successDark : Colors.textDark}>
              {customer.name}
            </UrduText>
            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={12} color={Colors.textMuted} />
              <UrduText size={12} color={Colors.textMuted} style={{ marginRight: 3 }}>
                {customer.phone}
              </UrduText>
            </View>
          </View>
        </View>

        {/* Quick Contact & Customer Type */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.quickCallBtn}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={14} color={Colors.primary} />
          </TouchableOpacity>

          <View 
            style={[
              styles.badge, 
              customer.customer_type === 'spot' 
                ? styles.spotBadge 
                : styles.khataBadge
            ]}
          >
            <UrduText 
              size={11} 
              weight="bold" 
              color={customer.customer_type === 'spot' ? '#92400E' : Colors.primary}
            >
              {customer.customer_type === 'spot' 
                ? UrduStrings.customerTypes.spotShort 
                : UrduStrings.customerTypes.khataShort}
            </UrduText>
          </View>
        </View>
      </View>

      {/* Middle Controls: Liters Stepper & Price Preview */}
      <View style={styles.controlsRow}>
        {/* Stepper Controls [-] 2.0 L [+] */}
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={[styles.stepperBtn, liters <= 0.5 && styles.btnDisabled]}
            onPress={handleDecrease}
            disabled={liters <= 0.5}
            activeOpacity={0.6}
          >
            <Ionicons name="remove" size={18} color={liters <= 0.5 ? '#94A3B8' : Colors.textDark} />
          </TouchableOpacity>

          <View style={styles.litersDisplay}>
            <UrduText size={20} weight="bold" color={Colors.textDark}>
              {liters.toFixed(1)}
            </UrduText>
            <UrduText size={11} weight="medium" color={Colors.textMuted}>
              {UrduStrings.daily.litersUnit}
            </UrduText>
          </View>

          <TouchableOpacity
            style={styles.stepperBtn}
            onPress={handleIncrease}
            activeOpacity={0.6}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calculated Price Preview */}
        <View style={styles.pricePreviewBlock}>
          <UrduText size={11} color={Colors.textMuted}>
            حساب ({currentRate} روپے/L)
          </UrduText>
          <View style={styles.priceValueRow}>
            <UrduText size={18} weight="bold" color={isDelivered ? Colors.successDark : Colors.primary}>
              {totalPrice.toLocaleString('en-US')}
            </UrduText>
            <UrduText size={12} weight="bold" color={isDelivered ? Colors.successDark : Colors.primary} style={{ marginRight: 3 }}>
              {UrduStrings.daily.rupeesUnit}
            </UrduText>
          </View>
        </View>
      </View>

      {/* Quick Liters Preset Pills: Reset to Default, +0.5L, +1L */}
      <View style={styles.presetsRow}>
        <TouchableOpacity
          style={[styles.presetChip, liters === customer.default_liters && styles.presetChipActive]}
          onPress={handleResetToDefault}
          activeOpacity={0.7}
        >
          <UrduText
            size={11}
            weight={liters === customer.default_liters ? 'bold' : 'medium'}
            color={liters === customer.default_liters ? Colors.primary : Colors.textMuted}
          >
            معمول ({customer.default_liters} L)
          </UrduText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => handleAddQuick(0.5)}
          activeOpacity={0.7}
        >
          <UrduText size={11} weight="medium" color={Colors.textDark}>
            + 0.5 L
          </UrduText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => handleAddQuick(1.0)}
          activeOpacity={0.7}
        >
          <UrduText size={11} weight="medium" color={Colors.textDark}>
            + 1.0 L
          </UrduText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.presetChip}
          onPress={() => handleAddQuick(2.0)}
          activeOpacity={0.7}
        >
          <UrduText size={11} weight="medium" color={Colors.textDark}>
            + 2.0 L
          </UrduText>
        </TouchableOpacity>
      </View>

      {/* Action Button: Single-tap confirmation */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isDelivered ? styles.actionDeliveredBtn : styles.actionPendingBtn
        ]}
        onPress={handleToggle}
        activeOpacity={0.85}
      >
        <Ionicons 
          name={isDelivered ? "checkmark-circle" : "water"} 
          size={19} 
          color="#FFFFFF" 
          style={{ marginLeft: 6 }} 
        />
        <UrduText size={14} weight="bold" color="#FFFFFF">
          {isDelivered 
            ? `دودھ دے دیا گیا ✓ (${liters.toFixed(1)} لیٹر - ${totalPrice.toLocaleString()} روپے)`
            : `دودھ فراہم کریں (${liters.toFixed(1)} لیٹر - ${totalPrice.toLocaleString()} روپے)`}
        </UrduText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 13,
    marginHorizontal: 12,
    marginBottom: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1.5,
  },
  cardPending: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  cardDelivered: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.success,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarAndName: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPending: {
    backgroundColor: Colors.primary,
  },
  avatarDelivered: {
    backgroundColor: Colors.success,
  },
  nameBlock: {
    alignItems: 'flex-end',
    flex: 1,
  },
  phoneRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  quickCallBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  spotBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
  },
  khataBadge: {
    backgroundColor: Colors.primarySoft,
    borderColor: '#BFDBFE',
    borderWidth: 1,
  },
  controlsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 6,
  },
  stepperContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  litersDisplay: {
    paddingHorizontal: 8,
    alignItems: 'center',
    minWidth: 50,
  },
  pricePreviewBlock: {
    alignItems: 'flex-start',
    flexShrink: 1,
  },
  priceValueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    marginTop: 2,
  },
  presetsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    rowGap: 6,
    marginBottom: 10,
  },
  presetChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: Colors.primarySoft,
    borderColor: '#93C5FD',
  },
  actionButton: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionPendingBtn: {
    backgroundColor: Colors.primary,
  },
  actionDeliveredBtn: {
    backgroundColor: Colors.success,
  },
});
