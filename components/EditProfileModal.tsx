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
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { UrduStrings } from '../constants/urduStrings';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../lib/haptics';
import { DairyOwner } from '../types/database.types';

interface EditProfileModalProps {
  visible: boolean;
  profile: DairyOwner | null;
  onClose: () => void;
  onSave: (updates: Partial<DairyOwner>) => Promise<void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
}) => {
  const [farmName, setFarmName] = useState(profile?.farm_name || '');
  const [ownerName, setOwnerName] = useState(profile?.owner_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [capacity, setCapacity] = useState(String(profile?.default_capacity || 65));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFarmName(profile.farm_name || '');
      setOwnerName(profile.owner_name || '');
      setPhone(profile.phone || '');
      setCapacity(String(profile.default_capacity || 65));
    }
  }, [profile, visible]);

  const handleSave = async () => {
    if (!farmName.trim() || !ownerName.trim()) {
      Alert.alert(UrduStrings.alerts.error, UrduStrings.alerts.fillRequired);
      triggerHaptic.error();
      return;
    }

    const numCapacity = parseFloat(capacity);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      Alert.alert(UrduStrings.alerts.error, 'برائے مہربانی درست گنجائش درج کریں۔');
      triggerHaptic.error();
      return;
    }

    setSaving(true);
    try {
      await onSave({
        farm_name: farmName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        default_capacity: numCapacity,
      });
      triggerHaptic.success();
      onClose();
    } catch {
      Alert.alert(UrduStrings.alerts.error, 'پروفائل محفوظ نہیں ہو سکی۔');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
            <UrduText size={18} weight="bold" color={Colors.textDark}>
              {UrduStrings.profile.editProfile}
            </UrduText>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
            {/* فارم کا نام */}
            <View style={styles.formGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.label}>
                {UrduStrings.profile.farmName} *
              </UrduText>
              <TextInput
                style={styles.textInput}
                value={farmName}
                onChangeText={setFarmName}
                placeholder="مثلاً: ڈیری مینجمنٹ"
                placeholderTextColor={Colors.textMuted}
                textAlign="right"
              />
            </View>

            {/* مالک کا نام */}
            <View style={styles.formGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.label}>
                {UrduStrings.profile.ownerName} *
              </UrduText>
              <TextInput
                style={styles.textInput}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="مثلاً: محمد اویس"
                placeholderTextColor={Colors.textMuted}
                textAlign="right"
              />
            </View>

            {/* رابطہ نمبر */}
            <View style={styles.formGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.label}>
                {UrduStrings.profile.phone}
              </UrduText>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="03001234567"
                placeholderTextColor={Colors.textMuted}
                textAlign="right"
              />
            </View>

            {/* روزانہ گنجائش */}
            <View style={styles.formGroup}>
              <UrduText size={13} weight="medium" color={Colors.textDark} style={styles.label}>
                {UrduStrings.profile.dailyCapacity} (لیٹر میں) *
              </UrduText>
              <TextInput
                style={styles.textInput}
                value={capacity}
                onChangeText={setCapacity}
                keyboardType="numeric"
                placeholder="65.0"
                placeholderTextColor={Colors.textMuted}
                textAlign="right"
              />
            </View>

            {/* محفوظ کریں بٹن */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.saveBtnContent}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                  <UrduText size={16} weight="bold" color="#FFFFFF" style={{ marginRight: 8 }}>
                    {UrduStrings.profile.saveChanges}
                  </UrduText>
                </View>
              )}
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  body: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'NotoSansArabic_400Regular',
    color: Colors.textDark,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
