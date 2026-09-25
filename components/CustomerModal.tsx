import React, { useState, useEffect } from 'react';
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
import { Customer, CustomerType } from '../types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../lib/haptics';

interface CustomerModalProps {
  visible: boolean;
  customerToEdit: Customer | null;
  onClose: () => void;
  onSaveCustomer: (customerData: {
    name: string;
    phone: string;
    default_liters: number;
    price_per_liter: number;
    customer_type: CustomerType;
  }) => Promise<void>;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  visible,
  customerToEdit,
  onClose,
  onSaveCustomer,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultLiters, setDefaultLiters] = useState('2.0');
  const [pricePerLiter, setPricePerLiter] = useState('240');
  const [customerType, setCustomerType] = useState<CustomerType>('khata');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name);
      setPhone(customerToEdit.phone);
      setDefaultLiters(String(customerToEdit.default_liters));
      setPricePerLiter(String(customerToEdit.price_per_liter));
      setCustomerType(customerToEdit.customer_type);
    } else {
      setName('');
      setPhone('');
      setDefaultLiters('2.0');
      setPricePerLiter('240');
      setCustomerType('khata');
    }
  }, [customerToEdit, visible]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const litersNum = parseFloat(defaultLiters);
    const rateNum = parseFloat(pricePerLiter);

    if (!trimmedName) {
      Alert.alert(UrduStrings.alerts.error, 'گاہک کا نام درج کرنا ضروری ہے۔');
      triggerHaptic.error();
      return;
    }

    if (!trimmedPhone || trimmedPhone.length < 10) {
      Alert.alert(UrduStrings.alerts.error, UrduStrings.alerts.phoneRequired);
      triggerHaptic.error();
      return;
    }

    if (isNaN(litersNum) || litersNum <= 0) {
      Alert.alert(UrduStrings.alerts.error, 'دودھ کی درست مقدار درج کریں۔');
      triggerHaptic.error();
      return;
    }

    if (isNaN(rateNum) || rateNum <= 0) {
      Alert.alert(UrduStrings.alerts.error, 'درست ریٹ فی لیٹر درج کریں۔');
      triggerHaptic.error();
      return;
    }

    try {
      setIsSaving(true);
      await onSaveCustomer({
        name: trimmedName,
        phone: trimmedPhone,
        default_liters: litersNum,
        price_per_liter: rateNum,
        customer_type: customerType,
      });
      onClose();
    } catch (e) {
      Alert.alert(UrduStrings.alerts.error, 'گاہک محفوظ کرنے میں مسئلہ پیش آیا ہے۔');
    } finally {
      setIsSaving(false);
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
              {customerToEdit ? 'گاہک کی تفصیلات میں ترمیم' : UrduStrings.customers.addNew}
            </UrduText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Name */}
            <View style={styles.inputGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                {UrduStrings.customers.name} *
              </UrduText>
              <TextInput
                style={styles.textInput}
                placeholder="مثلاً: چوہدری طارق گجر"
                placeholderTextColor="#94A3B8"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                {UrduStrings.customers.phone} *
              </UrduText>
              <TextInput
                style={styles.textInput}
                placeholder="03001234567"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* Liters and Rate 2-Column Row */}
            <View style={styles.twoColumnRow}>
              {/* Default Liters */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                  {UrduStrings.customers.defaultLiters} *
                </UrduText>
                <TextInput
                  style={styles.textInput}
                  placeholder="2.0"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={defaultLiters}
                  onChangeText={setDefaultLiters}
                />
              </View>

              {/* Price Per Liter */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                  {UrduStrings.customers.pricePerLiter} *
                </UrduText>
                <TextInput
                  style={styles.textInput}
                  placeholder="240"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={pricePerLiter}
                  onChangeText={setPricePerLiter}
                />
              </View>
            </View>

            {/* Customer Type Selector */}
            <View style={styles.inputGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.inputLabel}>
                {UrduStrings.customers.customerType}
              </UrduText>
              <View style={styles.typesRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    customerType === 'khata' && styles.typeBtnKhataSelected,
                  ]}
                  onPress={() => {
                    setCustomerType('khata');
                    triggerHaptic.selection();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="book" 
                    size={16} 
                    color={customerType === 'khata' ? '#FFFFFF' : Colors.primary} 
                    style={{ marginLeft: 6 }} 
                  />
                  <UrduText
                    size={13}
                    weight={customerType === 'khata' ? 'bold' : 'regular'}
                    color={customerType === 'khata' ? '#FFFFFF' : Colors.primary}
                  >
                    {UrduStrings.customerTypes.khata}
                  </UrduText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    customerType === 'spot' && styles.typeBtnSpotSelected,
                  ]}
                  onPress={() => {
                    setCustomerType('spot');
                    triggerHaptic.selection();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="cash" 
                    size={16} 
                    color={customerType === 'spot' ? '#FFFFFF' : '#B45309'} 
                    style={{ marginLeft: 6 }} 
                  />
                  <UrduText
                    size={13}
                    weight={customerType === 'spot' ? 'bold' : 'regular'}
                    color={customerType === 'spot' ? '#FFFFFF' : '#B45309'}
                  >
                    {UrduStrings.customerTypes.spot}
                  </UrduText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                onPress={handleSave}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
                <UrduText size={16} weight="bold" color="#FFFFFF">
                  {UrduStrings.customers.save}
                </UrduText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <UrduText size={15} weight="medium" color={Colors.textMuted}>
                  {UrduStrings.customers.cancel}
                </UrduText>
              </TouchableOpacity>
            </View>
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
  inputGroup: {
    marginBottom: 14,
  },
  twoColumnRow: {
    flexDirection: 'row-reverse',
    gap: 12,
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
  typesRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
  },
  typeBtnKhataSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeBtnSpotSelected: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  actionRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    marginBottom: 16,
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  btnDisabled: {
    opacity: 0.6,
  }
});
