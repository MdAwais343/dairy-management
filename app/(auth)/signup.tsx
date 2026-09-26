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
import { Ionicons } from '@expo/vector-icons';
import { DairyFarmIllustration } from '../../components/DairyFarmIllustration';
import { getUrduAuthErrorMessage } from './login';

export default function SignUpScreen() {
  const router = useRouter();

  const [farmName, setFarmName] = useState('ڈیری مینجمنٹ');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [capacity, setCapacity] = useState('60');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [farmNameError, setFarmNameError] = useState('');
  const [ownerNameError, setOwnerNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const farmNameRef = useRef<ShakeableInputRef>(null);
  const ownerNameRef = useRef<ShakeableInputRef>(null);
  const phoneRef = useRef<ShakeableInputRef>(null);
  const emailRef = useRef<ShakeableInputRef>(null);
  const passwordRef = useRef<ShakeableInputRef>(null);

  const signup = useAuthStore((state) => state.signup);

  const validate = () => {
    let isValid = true;
    setFarmNameError('');
    setOwnerNameError('');
    setPhoneError('');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    if (!farmName.trim()) {
      setFarmNameError('ڈیری فارم کا نام درج کریں۔');
      farmNameRef.current?.shake();
      isValid = false;
    }

    if (!ownerName.trim()) {
      setOwnerNameError('مالک کا نام درج کریں۔');
      ownerNameRef.current?.shake();
      isValid = false;
    }

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length < 10) {
      setPhoneError('درست موبائل نمبر درج کریں (مثلاً: 03001234567)۔');
      phoneRef.current?.shake();
      isValid = false;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setEmailError('درست ای میل ایڈریس درج کریں۔');
      emailRef.current?.shake();
      isValid = false;
    }

    if (!password || password.length < 6) {
      setPasswordError('پاس ورڈ کم از کم 6 ہندسوں پر مشتمل ہو۔');
      passwordRef.current?.shake();
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup({
        farm_name: farmName.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        default_capacity: parseFloat(capacity) || 50.0,
        email: email.trim(),
        password,
      });
      // Navigation guard in root layout will redirect to (tabs)
    } catch (err: any) {
      const errMsg = getUrduAuthErrorMessage(err);
      setGeneralError(errMsg);
      Alert.alert('رجسٹریشن میں خرابی', errMsg);
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
          {/* Header */}
          <View style={styles.headerBlock}>
            <DairyFarmIllustration scene="emblem" size={76} />
            <UrduText size={22} weight="bold" color={Colors.primary} style={{ marginTop: 10 }}>
              نیا فارم مالک رجسٹر کریں
            </UrduText>
            <UrduText size={13} color={Colors.textMuted} style={{ marginTop: 3 }}>
              فارم اور مالک کی بنیادی معلومات درج کریں
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

            {/* Farm Name */}
            <ShakeableInput
              ref={farmNameRef}
              label="فارم کا نام"
              placeholder="مثلاً: ڈیری مینجمنٹ"
              iconName="home-outline"
              value={farmName}
              onChangeText={(t) => {
                setFarmName(t);
                if (farmNameError) setFarmNameError('');
              }}
              error={farmNameError}
            />

            {/* Owner Name */}
            <ShakeableInput
              ref={ownerNameRef}
              label="فارم مالک کا نام"
              placeholder="مثلاً: محمد اویس"
              iconName="person-outline"
              value={ownerName}
              onChangeText={(t) => {
                setOwnerName(t);
                if (ownerNameError) setOwnerNameError('');
              }}
              error={ownerNameError}
            />

            {/* Phone & Capacity in 2 Columns */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <ShakeableInput
                  label="روزانہ پیداوار (L)"
                  placeholder="60"
                  keyboardType="numeric"
                  iconName="water-outline"
                  value={capacity}
                  onChangeText={setCapacity}
                />
              </View>

              <View style={{ flex: 1.4 }}>
                <ShakeableInput
                  ref={phoneRef}
                  label="موبائل نمبر"
                  placeholder="03001234567"
                  keyboardType="phone-pad"
                  iconName="call-outline"
                  value={phone}
                  onChangeText={(t) => {
                    setPhone(t);
                    if (phoneError) setPhoneError('');
                  }}
                  error={phoneError}
                />
              </View>
            </View>

            {/* Email */}
            <ShakeableInput
              ref={emailRef}
              label="ای میل ایڈریس"
              placeholder="owner@farm.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              iconName="mail-outline"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError('');
              }}
              error={emailError}
            />

            {/* Password */}
            <ShakeableInput
              ref={passwordRef}
              label="پاس ورڈ (کم از کم 6 ہندسے)"
              placeholder="••••••••"
              iconName="lock-closed-outline"
              isPassword
              showPassword={showPassword}
              onToggleShowPassword={() => setShowPassword(!showPassword)}
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
            />

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
              onPress={handleSignUp}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  <UrduText size={16} weight="bold" color="#FFFFFF">
                    اکاؤنٹ بنائیں اور شروع کریں
                  </UrduText>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer Back to Login */}
          <View style={styles.footerRow}>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <UrduText size={14} weight="bold" color={Colors.primary}>
                لاگ ان کریں
              </UrduText>
            </TouchableOpacity>
            <UrduText size={14} color={Colors.textMuted} style={{ marginRight: 6 }}>
              پہلے سے اکاؤنٹ موجود ہے؟
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
    padding: 20,
    justifyContent: 'center',
  },
  headerBlock: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
  twoColRow: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  submitBtn: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  footerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});
