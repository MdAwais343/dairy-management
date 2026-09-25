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
} from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { UrduStrings } from '../constants/urduStrings';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../lib/haptics';

interface CapacityModalProps {
  visible: boolean;
  currentCapacity: number;
  onClose: () => void;
  onSaveCapacity: (capacity: number) => Promise<void>;
}

export const CapacityModal: React.FC<CapacityModalProps> = ({
  visible,
  currentCapacity,
  onClose,
  onSaveCapacity,
}) => {
  const [capacity, setCapacity] = useState(String(currentCapacity));

  useEffect(() => {
    setCapacity(String(currentCapacity));
  }, [currentCapacity, visible]);

  const handleSave = async () => {
    const val = parseFloat(capacity);
    if (isNaN(val) || val <= 0) {
      Alert.alert(UrduStrings.alerts.error, 'درست گنجائش درج کریں۔');
      triggerHaptic.error();
      return;
    }
    await onSaveCapacity(val);
    onClose();
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
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
            <UrduText size={18} weight="bold" color={Colors.textDark}>
              {UrduStrings.daily.editCapacity}
            </UrduText>
          </View>

          <View style={styles.body}>
            <UrduText size={13} color={Colors.textMedium} style={{ marginBottom: 10 }}>
              آج فارم میں کل کتنا دودھ موجود ہے؟
            </UrduText>

            <View style={styles.inputRow}>
              <UrduText size={16} weight="medium" color={Colors.textMuted} style={{ marginLeft: 8 }}>
                {UrduStrings.daily.litersUnit}
              </UrduText>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={capacity}
                onChangeText={setCapacity}
                placeholder="60.0"
              />
            </View>

            {/* Quick Presets */}
            <View style={styles.presetRow}>
              {[40, 50, 60, 70, 80].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.presetBadge}
                  onPress={() => {
                    setCapacity(String(num));
                    triggerHaptic.selection();
                  }}
                >
                  <UrduText size={12} weight="medium" color={Colors.primary}>
                    {num} L
                  </UrduText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <UrduText size={16} weight="bold" color="#FFFFFF">
                محفوظ کریں
              </UrduText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  body: {
    alignItems: 'stretch',
  },
  inputRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 14,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  presetBadge: {
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
});
