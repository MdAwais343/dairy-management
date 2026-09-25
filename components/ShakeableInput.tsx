import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Colors } from '../constants/theme';
import { UrduText } from './UrduText';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../lib/haptics';

export interface ShakeableInputRef {
  shake: () => void;
}

interface ShakeableInputProps extends TextInputProps {
  label: string;
  error?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  showPassword?: boolean;
  onToggleShowPassword?: () => void;
}

export const ShakeableInput = forwardRef<ShakeableInputRef, ShakeableInputProps>(
  (
    {
      label,
      error,
      iconName,
      isPassword = false,
      showPassword = false,
      onToggleShowPassword,
      style,
      ...textInputProps
    },
    ref
  ) => {
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
      triggerHaptic.error();
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    };

    useImperativeHandle(ref, () => ({
      shake,
    }));

    return (
      <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
        <View style={styles.labelRow}>
          {error ? (
            <UrduText size={11} weight="medium" color={Colors.danger}>
              {error}
            </UrduText>
          ) : null}
          <UrduText size={13} weight="medium" color={error ? Colors.danger : Colors.textDark}>
            {label}
          </UrduText>
        </View>

        <View
          style={[
            styles.inputWrapper,
            error ? styles.inputError : styles.inputNormal,
          ]}
        >
          {iconName && (
            <Ionicons
              name={iconName}
              size={18}
              color={error ? Colors.danger : Colors.textMuted}
              style={styles.leadingIcon}
            />
          )}

          <TextInput
            style={[styles.input, style]}
            placeholderTextColor="#94A3B8"
            secureTextEntry={isPassword && !showPassword}
            {...textInputProps}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={onToggleShowPassword}
              style={styles.eyeBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }
);

ShakeableInput.displayName = 'ShakeableInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  inputNormal: {
    borderColor: '#CBD5E1',
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  leadingIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
    color: Colors.textDark,
    textAlign: 'right',
  },
  eyeBtn: {
    padding: 6,
  },
});
