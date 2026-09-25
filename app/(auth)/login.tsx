import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { UrduText } from '../../components/UrduText';
import { ShakeableInput, ShakeableInputRef } from '../../components/ShakeableInput';
import { useAuthStore } from '../../store/authStore';
import { triggerHaptic } from '../../lib/haptics';
import { Ionicons } from '@expo/vector-icons';
import { DairyFarmIllustration } from '../../components/DairyFarmIllustration';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRef = useRef<ShakeableInputRef>(null);
  const passwordRef = useRef<ShakeableInputRef>(null);

  const login = useAuthStore((state) => state.login);
  const demoLogin = useAuthStore((state) => state.demoLogin);

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('برائے مہربانی ای میل درج کریں۔');
      emailRef.current?.shake();
      isValid = false;
    } else if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setEmailError('درست ای میل ایڈریس درج کریں۔');
      emailRef.current?.shake();
      isValid = false;
    }

    if (!password) {
      setPasswordError('پاس ورڈ درج کرنا ضروری ہے۔');
      passwordRef.current?.shake();
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('پاس ورڈ کم از کم 6 ہندسوں پر مشتمل ہو۔');
      passwordRef.current?.shake();
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // Navigation guard in root layout will redirect to (tabs)
    } catch (err: any) {
      const errMsg = err?.message || 'لاگ ان کرنے میں ناکامی۔ برائے مہربانی ای میل اور پاس ورڈ چیک کریں۔';
      setGeneralError(errMsg);
      emailRef.current?.shake();
      passwordRef.current?.shake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    triggerHaptic.selection();
    setIsSubmitting(true);
    try {
      await demoLogin();
    } catch (err) {
      Alert.alert('خرابی', 'ڈیمو لاگ ان میں مسئلہ پیش آیا ہے۔');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Card / Logo */}
          <View style={styles.headerBlock}>
            <DairyFarmIllustration scene="emblem" size={76} />
            <UrduText size={24} weight="bold" color={Colors.primary} style={{ marginTop: 12 }}>
              فارم مالک لاگ ان
            </UrduText>
            <UrduText size={13} color={Colors.textMuted} style={{ marginTop: 4 }}>
              ڈیری مینجمنٹ سسٹم
            </UrduText>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {generalError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <UrduText size={12} weight="medium" color={Colors.danger} style={{ marginRight: 6, flex: 1 }}>
                  {generalError}
                </UrduText>
              </View>
            ) : null}

            {/* Email Input */}
            <ShakeableInput
              ref={emailRef}
              label="ای میل ایڈریس"
              placeholder="owner@farm.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              iconName="mail-outline"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              error={emailError}
            />

            {/* Password Input */}
            <ShakeableInput
              ref={passwordRef}
              label="پاس ورڈ"
              placeholder="••••••••"
              iconName="lock-closed-outline"
              isPassword
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
            />

            {/* Login Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  <UrduText size={16} weight="bold" color="#FFFFFF">
                    لاگ ان کریں
                  </UrduText>
                </>
              )}
            </TouchableOpacity>

            {/* Quick Demo Login Option */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <UrduText size={12} color={Colors.textMuted} style={{ marginHorizontal: 10 }}>
                یا ڈیمو ٹیسٹ موڈ
              </UrduText>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleDemoLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Ionicons name="flash-outline" size={18} color={Colors.primary} style={{ marginLeft: 6 }} />
              <UrduText size={14} weight="bold" color={Colors.primary}>
                فوری ڈیمو فارم لاگ ان (Quick Demo)
              </UrduText>
            </TouchableOpacity>
          </View>

          {/* Footer Navigation to Signup */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => router.push('/signup')} activeOpacity={0.7}>
              <UrduText size={14} weight="bold" color={Colors.primary}>
                نیا اکاؤنٹ رجسٹر کریں
              </UrduText>
            </TouchableOpacity>
            <UrduText size={14} color={Colors.textMuted} style={{ marginRight: 6 }}>
              کیا آپ نئے فارم مالک ہیں؟
            </UrduText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  errorBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  submitBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  dividerRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  demoBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 12,
  },
  footerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
});
