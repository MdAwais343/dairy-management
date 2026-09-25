import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { UrduText } from '../../components/UrduText';
import { UrduStrings } from '../../constants/urduStrings';
import { PaymentModal } from '../../components/PaymentModal';
import { useDairyStore, getCurrentYearMonth } from '../../store/dairyStore';
import {
  sendWhatsAppStatement,
  formatShortDate,
  formatRupees,
  WhatsAppStatementData,
} from '../../lib/whatsappBilling';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../../lib/haptics';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);

  const customers = useDairyStore((state) => state.customers);
  const dailyPickups = useDairyStore((state) => state.dailyPickups);
  const payments = useDairyStore((state) => state.payments);
  const getCustomerLedger = useDairyStore((state) => state.getCustomerLedger);
  const recordPayment = useDairyStore((state) => state.recordPayment);

  const customer = customers.find((c) => c.id === id);
  const currentYM = getCurrentYearMonth();
  const ledger = customer ? getCustomerLedger(customer.id, currentYM) : null;

  // Filter pickups for this customer sorted descending
  const customerPickups = useMemo(() => {
    return dailyPickups
      .filter((p) => p.customer_id === id)
      .sort((a, b) => b.pickup_date.localeCompare(a.pickup_date));
  }, [dailyPickups, id]);

  // Filter payments for this customer sorted descending
  const customerPayments = useMemo(() => {
    return payments
      .filter((p) => p.customer_id === id)
      .sort((a, b) => b.payment_date.localeCompare(a.payment_date));
  }, [payments, id]);

  const currentMonthName = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ur-PK', { month: 'long', year: 'numeric' });
  }, []);

  if (!customer || !ledger) {
    return (
      <View style={styles.notFoundContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.danger} />
        <UrduText size={16} weight="bold" color={Colors.textDark} style={{ marginTop: 10 }}>
          گاہک نہیں مل سکا۔
        </UrduText>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <UrduText size={14} weight="medium" color={Colors.primary}>
            واپس جائیں
          </UrduText>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSendWhatsApp = async () => {
    triggerHaptic.selection();
    const statementData: WhatsAppStatementData = {
      customer,
      monthName: currentMonthName,
      pickups: customerPickups.filter((p) => p.pickup_date.startsWith(currentYM)),
      payments: customerPayments,
    };
    await sendWhatsAppStatement(statementData);
  };

  const hasDue = ledger.balance_due > 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Customer Header Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.nameBlock}>
              <UrduText size={20} weight="bold" color={Colors.textDark}>
                {customer.name}
              </UrduText>
              <UrduText size={13} color={Colors.textMuted}>
                {customer.phone}
              </UrduText>
            </View>
            <View
              style={[
                styles.badge,
                customer.customer_type === 'spot' ? styles.spotBadge : styles.khataBadge,
              ]}
            >
              <UrduText
                size={11}
                weight="medium"
                color={customer.customer_type === 'spot' ? '#92400E' : Colors.primary}
              >
                {customer.customer_type === 'spot'
                  ? UrduStrings.customerTypes.spot
                  : UrduStrings.customerTypes.khata}
              </UrduText>
            </View>
          </View>

          {/* Quick Metrics Grid */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <UrduText size={11} color={Colors.textMuted}>
                معمول کا دودھ
              </UrduText>
              <UrduText size={15} weight="bold" color={Colors.textDark}>
                {customer.default_liters} L
              </UrduText>
            </View>

            <View style={styles.metricItem}>
              <UrduText size={11} color={Colors.textMuted}>
                ریٹ فی لیٹر
              </UrduText>
              <UrduText size={15} weight="bold" color={Colors.primary}>
                {customer.price_per_liter} روپے
              </UrduText>
            </View>

            <View style={styles.metricItem}>
              <UrduText size={11} color={Colors.textMuted}>
                ماہانہ دودھ
              </UrduText>
              <UrduText size={15} weight="bold" color={Colors.textDark}>
                {ledger.current_month_liters.toFixed(1)} L
              </UrduText>
            </View>
          </View>

          {/* Balance Due Banner */}
          <View
            style={[
              styles.dueBanner,
              hasDue ? styles.dueBannerActive : styles.dueBannerCleared,
            ]}
          >
            <UrduText size={13} color={Colors.textMedium}>
              {UrduStrings.billing.balanceDue}:
            </UrduText>
            <UrduText
              size={20}
              weight="bold"
              color={hasDue ? Colors.danger : Colors.successDark}
              style={{ marginRight: 8 }}
            >
              {hasDue
                ? `${Math.round(ledger.balance_due).toLocaleString('en-US')} روپے`
                : 'کھاتہ بے باق ہے ✓'}
            </UrduText>
          </View>

          {/* Action Buttons: WhatsApp & Record Payment */}
          <View style={styles.headerButtonsRow}>
            <TouchableOpacity
              style={styles.whatsAppBtn}
              onPress={handleSendWhatsApp}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
              <UrduText size={13} weight="bold" color="#FFFFFF">
                واٹس ایپ بل بھیجیں
              </UrduText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.recordPaymentBtn}
              onPress={() => {
                triggerHaptic.selection();
                setIsPaymentModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="card" size={17} color="#FFFFFF" style={{ marginLeft: 6 }} />
              <UrduText size={13} weight="bold" color="#FFFFFF">
                ادائیگی درج کریں
              </UrduText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 1: Recent Pickups History */}
        <View style={styles.sectionHeaderRow}>
          <UrduText size={16} weight="bold" color={Colors.textDark}>
            🥛 دودھ ٹیک اوے کی تفصیل ({customerPickups.length})
          </UrduText>
        </View>

        <View style={styles.historyTable}>
          {customerPickups.length === 0 ? (
            <UrduText size={13} color={Colors.textMuted} align="center" style={{ padding: 16 }}>
              کوئی سابقہ ریکارڈ موجود نہیں۔
            </UrduText>
          ) : (
            customerPickups.map((p, index) => (
              <View
                key={p.id || index}
                style={[
                  styles.tableRow,
                  index < customerPickups.length - 1 && styles.tableRowBorder,
                ]}
              >
                <View style={styles.rowRightCol}>
                  <Ionicons name="calendar-outline" size={15} color={Colors.textMuted} />
                  <UrduText size={13} weight="medium" color={Colors.textDark} style={{ marginRight: 6 }}>
                    {p.pickup_date}
                  </UrduText>
                </View>

                <View style={styles.rowMiddleCol}>
                  <UrduText size={13} weight="bold" color={Colors.primary}>
                    {Number(p.liters).toFixed(1)} لیٹر
                  </UrduText>
                </View>

                <View style={styles.rowLeftCol}>
                  <UrduText size={13} weight="bold" color={Colors.textDark}>
                    {formatRupees(p.total_amount || (p.liters * p.rate))} روپے
                  </UrduText>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Section 2: Payments History */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <UrduText size={16} weight="bold" color={Colors.textDark}>
            💰 موصول شدہ ادائیگیاں ({customerPayments.length})
          </UrduText>
        </View>

        <View style={styles.historyTable}>
          {customerPayments.length === 0 ? (
            <UrduText size={13} color={Colors.textMuted} align="center" style={{ padding: 16 }}>
              ابھی تک کوئی ادائیگی موصول نہیں ہوئی۔
            </UrduText>
          ) : (
            customerPayments.map((pay, index) => (
              <View
                key={pay.id || index}
                style={[
                  styles.tableRow,
                  index < customerPayments.length - 1 && styles.tableRowBorder,
                ]}
              >
                <View style={styles.rowRightCol}>
                  <Ionicons name="cash-outline" size={15} color={Colors.successDark} />
                  <View style={{ marginRight: 6 }}>
                    <UrduText size={13} weight="medium" color={Colors.textDark}>
                      {pay.payment_date}
                    </UrduText>
                    {pay.notes && (
                      <UrduText size={11} color={Colors.textMuted}>
                        {pay.notes}
                      </UrduText>
                    )}
                  </View>
                </View>

                <View style={styles.rowMiddleCol}>
                  <UrduText size={12} color={Colors.textMuted}>
                    ({pay.payment_mode})
                  </UrduText>
                </View>

                <View style={styles.rowLeftCol}>
                  <UrduText size={14} weight="bold" color={Colors.successDark}>
                    +{formatRupees(pay.amount)} روپے
                  </UrduText>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={isPaymentModalVisible}
        ledger={ledger}
        onClose={() => setIsPaymentModalVisible(false)}
        onSubmitPayment={async (customerId, amount, mode, notes) => {
          await recordPayment(customerId, amount, mode, notes);
          Alert.alert(UrduStrings.alerts.success, UrduStrings.payment.successMsg);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backBtn: {
    marginTop: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primarySoft,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  nameBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  spotBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  khataBadge: {
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  metricsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  dueBanner: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  dueBannerActive: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dueBannerCleared: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  headerButtonsRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  whatsAppBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25D366',
    borderRadius: 12,
    paddingVertical: 11,
  },
  recordPaymentBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  tableRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowRightCol: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 2,
  },
  rowMiddleCol: {
    flex: 1,
    alignItems: 'center',
  },
  rowLeftCol: {
    flex: 1,
    alignItems: 'flex-start',
  },
});
