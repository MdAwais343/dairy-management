import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
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

  const handleToggle = () => {
    onTogglePickup(customer.id, liters);
  };

  return (
    <View 
      style={[
        styles.card,
        isDelivered ? styles.cardDelivered : styles.cardPending
      ]}
    >
      {/* Header Row: Customer Name, Phone & Badge */}
      <View style={styles.headerRow}>
        <View style={styles.nameBlock}>
          <UrduText size={18} weight="bold" color={isDelivered ? Colors.successDark : Colors.textDark}>
            {customer.name}
          </UrduText>
          <View style={styles.phoneRow}>
            <Ionicons name="call-outline" size={13} color={Colors.textMuted} />
            <UrduText size={12} color={Colors.textMuted} style={{ marginRight: 4 }}>
              {customer.phone}
            </UrduText>
          </View>
        </View>

        {/* Customer Type Badge */}
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
            weight="medium" 
            color={customer.customer_type === 'spot' ? '#92400E' : Colors.primary}
          >
            {customer.customer_type === 'spot' 
              ? UrduStrings.customerTypes.spotShort 
              : UrduStrings.customerTypes.khataShort}
          </UrduText>
        </View>
      </View>

      {/* Middle Controls: Liters Stepper & Price Preview */}
      <View style={styles.controlsRow}>
        {/* Stepper Controls [-] 2.0 L [+] */}
        <View style={styles.stepperContainer}>
          <TouchableOpacity
            style={[styles.stepperBtn, styles.decrementBtn, liters <= 0.5 && styles.btnDisabled]}
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
            style={[styles.stepperBtn, styles.incrementBtn]}
            onPress={handleIncrease}
            activeOpacity={0.6}
          >
            <Ionicons name="add" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Calculated Price Preview */}
        <View style={styles.pricePreviewBlock}>
          <UrduText size={11} color={Colors.textMuted}>
            {UrduStrings.daily.calculatedAmount} ({currentRate}/L)
          </UrduText>
          <View style={styles.priceValueRow}>
            <UrduText size={18} weight="bold" color={Colors.primary}>
              {totalPrice.toLocaleString('en-US')}
            </UrduText>
            <UrduText size={12} weight="medium" color={Colors.primary} style={{ marginRight: 3 }}>
              {UrduStrings.daily.rupeesUnit}
            </UrduText>
          </View>
        </View>
      </View>

      {/* Action Button: Single-tap confirmation */}
      <TouchableOpacity
        style={[
          styles.actionButton,
          isDelivered ? styles.actionDeliveredBtn : styles.actionPendingBtn
        ]}
        onPress={handleToggle}
        activeOpacity={0.8}
      >
        <Ionicons 
          name={isDelivered ? "checkmark-circle" : "water"} 
          size={18} 
          color="#FFFFFF" 
          style={{ marginLeft: 6 }} 
        />
        <UrduText size={15} weight="bold" color="#FFFFFF">
          {isDelivered 
            ? UrduStrings.daily.pickupGiven 
            : UrduStrings.daily.notGivenYet}
        </UrduText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1.5,
  },
  cardPending: {
    backgroundColor: Colors.card,
    borderColor: Colors.border,
  },
  cardDelivered: {
    backgroundColor: '#F0FDF4',
    borderColor: Colors.success,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  phoneRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 6,
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
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
    gap: 6,
  },
  stepperContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  decrementBtn: {},
  incrementBtn: {},
  btnDisabled: {
    opacity: 0.4,
  },
  litersDisplay: {
    paddingHorizontal: 6,
    alignItems: 'center',
    minWidth: 48,
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
  actionButton: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  actionPendingBtn: {
    backgroundColor: Colors.primary,
  },
  actionDeliveredBtn: {
    backgroundColor: Colors.success,
  }
});
