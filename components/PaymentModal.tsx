import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { UrduStrings } from '../constants/urduStrings';
import { CustomerLedger, PaymentMode } from '../types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../lib/haptics';

interface PaymentModalProps {
  visible: boolean;
  ledger: CustomerLedger | null;
  onClose: () => void;
  onSubmitPayment: (customerId: string, amount: number, mode: PaymentMode, notes?: string) => Promise<void>;
}

const PAYMENT_MODES: PaymentMode[] = ['نقد', 'جاز کیش', 'ایزی پیسہ', 'بینک'];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  ledger,
  onClose,
  onSubmitPayment,
}) => {
  const [amount, setAmount] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<PaymentMode>('نقد');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!ledger) return null;

  const handleQuickAmount = (val: number) => {
    setAmount(String(val));
    triggerHaptic.selection();
  };

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(UrduStrings.alerts.error, 'برائے مہربانی درست رقم درج کریں۔');
      triggerHaptic.error();
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmitPayment(ledger.customer_id, numAmount, selectedMode, notes.trim());
      setAmount('');
      setNotes('');
      setSelectedMode('نقد');
      onClose();
    } catch (e) {
      Alert.alert(UrduStrings.alerts.error, 'ادائیگی درج کرنے میں خرابی پیش آئی۔');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
            <UrduText size={18} weight="bold" color={Colors.textDark}>
              {UrduStrings.payment.modalTitle}
            </UrduText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Customer & Current Balance Info */}
            <View style={styles.customerBanner}>
              <View style={styles.customerNameRow}>
                <Ionicons name="person" size={18} color={Colors.primary} />
                <UrduText size={16} weight="bold" color={Colors.textDark} style={{ marginRight: 6 }}>
                  {ledger.name}
                </UrduText>
              </View>

              <View style={styles.dueRow}>
                <UrduText size={13} color={Colors.textMuted}>
                  {UrduStrings.billing.balanceDue}:
                </UrduText>
                <UrduText 
                  size={16} 
                  weight="bold" 
                  color={ledger.balance_due > 0 ? Colors.danger : Colors.successDark}
                  style={{ marginRight: 6 }}
                >
                  {Math.round(ledger.balance_due).toLocaleString('en-US')} {UrduStrings.daily.rupeesUnit}
                </UrduText>
              </View>
            </View>

            {/* Amount Input */}
            <View style={styles.inputGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                {UrduStrings.payment.amountLabel} *
              </UrduText>
              <TextInput
                style={styles.textInput}
                placeholder={UrduStrings.payment.amountPlaceholder}
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </View>

            {/* Quick Amount Suggestion Buttons */}
            {ledger.balance_due > 0 && (
              <View style={styles.quickAmountContainer}>
                <TouchableOpacity
                  style={styles.quickAmountBadge}
                  onPress={() => handleQuickAmount(Math.round(ledger.balance_due))}
                >
                  <UrduText size={11} color={Colors.primary} weight="medium">
                    مکمل واجب الادا ({Math.round(ledger.balance_due).toLocaleString('en-US')})
                  </UrduText>
                </TouchableOpacity>

                {ledger.balance_due >= 2000 && (
                  <TouchableOpacity
                    style={styles.quickAmountBadge}
                    onPress={() => handleQuickAmount(2000)}
                  >
                    <UrduText size={11} color={Colors.textMedium} weight="medium">
                      2,000
                    </UrduText>
                  </TouchableOpacity>
                )}

                {ledger.balance_due >= 5000 && (
                  <TouchableOpacity
                    style={styles.quickAmountBadge}
                    onPress={() => handleQuickAmount(5000)}
                  >
                    <UrduText size={11} color={Colors.textMedium} weight="medium">
                      5,000
                    </UrduText>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Payment Mode Selector */}
            <View style={styles.inputGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                {UrduStrings.payment.modeLabel}
              </UrduText>
              <View style={styles.modesGrid}>
                {PAYMENT_MODES.map((mode) => {
                  const isSelected = selectedMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.modeBtn,
                        isSelected && styles.modeBtnSelected,
                      ]}
                      onPress={() => {
                        setSelectedMode(mode);
                        triggerHaptic.selection();
                      }}
                      activeOpacity={0.7}
                    >
                      <UrduText
                        size={13}
                        weight={isSelected ? 'bold' : 'regular'}
                        color={isSelected ? '#FFFFFF' : Colors.textMedium}
                        align="center"
                      >
                        {mode}
                      </UrduText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Notes / Receipt */}
            <View style={styles.inputGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                {UrduStrings.payment.notesLabel}
              </UrduText>
              <TextInput
                style={[styles.textInput, styles.notesInput]}
                placeholder={UrduStrings.payment.notesPlaceholder}
                placeholderTextColor="#94A3B8"
                value={notes}
                onChangeText={setNotes}
                multiline
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
              <UrduText size={16} weight="bold" color="#FFFFFF">
                {UrduStrings.payment.submit}
              </UrduText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    padding: 4,
  },
  customerBanner: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  customerNameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 6,
  },
  dueRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'right',
  },
  notesInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  quickAmountContainer: {
    flexDirection: 'row-reverse',
    gap: 8,
    marginBottom: 14,
  },
  quickAmountBadge: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modesGrid: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modeBtnSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  submitBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  }
});
