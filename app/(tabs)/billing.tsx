import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { UrduText } from '../../components/UrduText';
import { UrduStrings } from '../../constants/urduStrings';
import { PaymentModal } from '../../components/PaymentModal';
import { useDairyStore, getCurrentYearMonth } from '../../store/dairyStore';
import { CustomerLedger, CustomerType } from '../../types/database.types';
import { sendWhatsAppStatement, WhatsAppStatementData } from '../../lib/whatsappBilling';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../../lib/haptics';

type FilterType = 'all' | 'khata' | 'spot';

export default function BillingScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [activePaymentLedger, setActivePaymentLedger] = useState<CustomerLedger | null>(null);

  const customers = useDairyStore((state) => state.customers);
  const dailyPickups = useDairyStore((state) => state.dailyPickups);
  const payments = useDairyStore((state) => state.payments);
  const getAllLedgers = useDairyStore((state) => state.getAllLedgers);
  const recordPayment = useDairyStore((state) => state.recordPayment);
  const fetchInitialData = useDairyStore((state) => state.fetchInitialData);

  const currentYM = getCurrentYearMonth();
  const allLedgers = useMemo(() => getAllLedgers(currentYM), [customers, dailyPickups, payments]);

  // Filtered ledgers
  const filteredLedgers = useMemo(() => {
    if (filter === 'khata') {
      return allLedgers.filter((l) => l.customer_type === 'khata');
    }
    if (filter === 'spot') {
      return allLedgers.filter((l) => l.customer_type === 'spot');
    }
    return allLedgers;
  }, [allLedgers, filter]);

  // Overall Monthly Stats
  const monthlyTotals = useMemo(() => {
    return allLedgers.reduce(
      (acc, curr) => {
        acc.totalLiters += curr.current_month_liters;
        acc.totalBill += curr.current_month_bill;
        acc.totalPaid += curr.total_paid;
        acc.totalDues += Math.max(0, curr.balance_due);
        return acc;
      },
      { totalLiters: 0, totalBill: 0, totalPaid: 0, totalDues: 0 }
    );
  }, [allLedgers]);

  // Current Month Name in Urdu
  const currentMonthName = useMemo(() => {
    const d = new Date();
    return d.toLocaleDateString('ur-PK', { month: 'long', year: 'numeric' });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic.selection();
    try {
      await fetchInitialData();
    } catch {}
    setRefreshing(false);
  };

  // Handle WhatsApp Statement Dispatch
  const handleWhatsAppSend = async (ledger: CustomerLedger) => {
    triggerHaptic.selection();
    const customer = customers.find((c) => c.id === ledger.customer_id);
    if (!customer) return;

    // Filter customer pickups for this month
    const customerPickups = dailyPickups.filter(
      (p) => p.customer_id === ledger.customer_id && p.pickup_date.startsWith(currentYM)
    );

    // Filter customer payments
    const customerPayments = payments.filter((p) => p.customer_id === ledger.customer_id);

    const statementData: WhatsAppStatementData = {
      customer,
      monthName: currentMonthName,
      pickups: customerPickups,
      payments: customerPayments,
    };

    await sendWhatsAppStatement(statementData);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <View style={styles.headerIcon}>
            <Ionicons name="receipt" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.titleColumn}>
            <UrduText
              size={19}
              weight="bold"
              color={Colors.primary}
              numberOfLines={1}
              style={{ paddingTop: 3, paddingBottom: 2 }}
            >
              {UrduStrings.billing.title}
            </UrduText>
            <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
              مہینہ: {currentMonthName}
            </UrduText>
          </View>
        </View>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredLedgers}
        keyExtractor={(item) => item.customer_id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Monthly Overview Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <UrduText size={12} color={Colors.textMuted}>
                    {UrduStrings.billing.totalMonthlySupply}
                  </UrduText>
                  <UrduText size={18} weight="bold" color={Colors.textDark}>
                    {monthlyTotals.totalLiters.toFixed(1)} {UrduStrings.daily.litersUnit}
                  </UrduText>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryItem}>
                  <UrduText size={12} color={Colors.textMuted}>
                    {UrduStrings.billing.monthBill}
                  </UrduText>
                  <UrduText size={18} weight="bold" color={Colors.primary}>
                    {Math.round(monthlyTotals.totalBill).toLocaleString('en-US')} {UrduStrings.daily.rupeesUnit}
                  </UrduText>
                </View>
              </View>

              <View style={styles.summaryCardSeparator} />

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <UrduText size={12} color={Colors.textMuted}>
                    {UrduStrings.billing.totalCollections}
                  </UrduText>
                  <UrduText size={18} weight="bold" color={Colors.successDark}>
                    {Math.round(monthlyTotals.totalPaid).toLocaleString('en-US')} {UrduStrings.daily.rupeesUnit}
                  </UrduText>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryItem}>
                  <UrduText size={12} color={Colors.dangerDark}>
                    {UrduStrings.billing.totalReceivable}
                  </UrduText>
                  <UrduText size={18} weight="bold" color={Colors.danger}>
                    {Math.round(monthlyTotals.totalDues).toLocaleString('en-US')} {UrduStrings.daily.rupeesUnit}
                  </UrduText>
                </View>
              </View>
            </View>

            {/* Filter Tabs: تمام, کھاتہ دار, سپاٹ */}
            <View style={styles.filterTabsContainer}>
              <TouchableOpacity
                style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
                onPress={() => {
                  setFilter('all');
                  triggerHaptic.selection();
                }}
              >
                <UrduText
                  size={13}
                  weight={filter === 'all' ? 'bold' : 'regular'}
                  color={filter === 'all' ? '#FFFFFF' : Colors.textMedium}
                >
                  {UrduStrings.billing.filterAll} ({allLedgers.length})
                </UrduText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTab, filter === 'khata' && styles.filterTabActive]}
                onPress={() => {
                  setFilter('khata');
                  triggerHaptic.selection();
                }}
              >
                <UrduText
                  size={13}
                  weight={filter === 'khata' ? 'bold' : 'regular'}
                  color={filter === 'khata' ? '#FFFFFF' : Colors.textMedium}
                >
                  {UrduStrings.billing.filterKhata} (
                  {allLedgers.filter((l) => l.customer_type === 'khata').length})
                </UrduText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterTab, filter === 'spot' && styles.filterTabActive]}
                onPress={() => {
                  setFilter('spot');
                  triggerHaptic.selection();
                }}
              >
                <UrduText
                  size={13}
                  weight={filter === 'spot' ? 'bold' : 'regular'}
                  color={filter === 'spot' ? '#FFFFFF' : Colors.textMedium}
                >
                  {UrduStrings.billing.filterSpot} (
                  {allLedgers.filter((l) => l.customer_type === 'spot').length})
                </UrduText>
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const hasBalanceDue = item.balance_due > 0;
          const isCleared = item.balance_due === 0;

          return (
            <View style={styles.ledgerCard}>
              {/* Card Top: Customer Avatar, Name, Phone & Type */}
              <View style={styles.cardHeader}>
                <View style={styles.avatarAndName}>
                  <View style={[styles.avatar, item.customer_type === 'spot' ? styles.avatarSpot : styles.avatarKhata]}>
                    <UrduText size={16} weight="bold" color="#FFFFFF">
                      {item.name.trim().charAt(0) || 'گ'}
                    </UrduText>
                  </View>
                  <View style={styles.customerNameBlock}>
                    <TouchableOpacity
                      onPress={() => router.push(`/customer/${item.customer_id}`)}
                      style={styles.nameWithIcon}
                    >
                      <UrduText size={17} weight="bold" color={Colors.textDark}>
                        {item.name}
                      </UrduText>
                      <Ionicons name="chevron-back" size={15} color={Colors.textMuted} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                    <UrduText size={12} color={Colors.textMuted}>
                      {item.phone} • {item.price_per_liter} روپے/L
                    </UrduText>
                  </View>
                </View>

                {/* Badge */}
                <View
                  style={[
                    styles.typeBadge,
                    item.customer_type === 'spot' ? styles.spotBadge : styles.khataBadge,
                  ]}
                >
                  <UrduText
                    size={11}
                    weight="medium"
                    color={item.customer_type === 'spot' ? '#92400E' : Colors.primary}
                  >
                    {item.customer_type === 'spot'
                      ? UrduStrings.customerTypes.spotShort
                      : UrduStrings.customerTypes.khataShort}
                  </UrduText>
                </View>
              </View>

              {/* Card Middle: 3-column metrics */}
              <View style={styles.metricsRow}>
                {/* Liters */}
                <View style={styles.metricCol}>
                  <UrduText size={11} color={Colors.textMuted}>
                    {UrduStrings.billing.monthLiters}
                  </UrduText>
                  <UrduText size={15} weight="bold" color={Colors.textDark}>
                    {item.current_month_liters.toFixed(1)} {UrduStrings.daily.litersUnit}
                  </UrduText>
                </View>

                <View style={styles.metricSeparator} />

                {/* Total Bill */}
                <View style={styles.metricCol}>
                  <UrduText size={11} color={Colors.textMuted}>
                    {UrduStrings.billing.monthBill}
                  </UrduText>
                  <UrduText size={15} weight="bold" color={Colors.textDark}>
                    {Math.round(item.current_month_bill).toLocaleString('en-US')}
                  </UrduText>
                </View>

                <View style={styles.metricSeparator} />

                {/* Total Paid */}
                <View style={styles.metricCol}>
                  <UrduText size={11} color={Colors.textMuted}>
                    {UrduStrings.billing.totalPaid}
                  </UrduText>
                  <UrduText size={15} weight="bold" color={Colors.successDark}>
                    {Math.round(item.total_paid).toLocaleString('en-US')}
                  </UrduText>
                </View>
              </View>

              {/* Net Balance Due Banner */}
              <View
                style={[
                  styles.balanceBanner,
                  hasBalanceDue
                    ? styles.balanceBannerDue
                    : isCleared
                    ? styles.balanceBannerCleared
                    : styles.balanceBannerAdvance,
                ]}
              >
                <UrduText size={13} weight="medium" color={Colors.textMedium}>
                  {UrduStrings.billing.balanceDue}:
                </UrduText>
                <UrduText
                  size={18}
                  weight="bold"
                  color={
                    hasBalanceDue
                      ? Colors.danger
                      : isCleared
                      ? Colors.successDark
                      : Colors.primary
                  }
                  style={{ marginRight: 6 }}
                >
                  {hasBalanceDue
                    ? `${Math.round(item.balance_due).toLocaleString('en-US')} ${UrduStrings.daily.rupeesUnit}`
                    : isCleared
                    ? UrduStrings.billing.balanceCleared
                    : `${Math.round(Math.abs(item.balance_due)).toLocaleString('en-US')} ایڈوانس`}
                </UrduText>
              </View>

              {/* Card Action Buttons */}
              <View style={styles.actionsRow}>
                {/* Record Payment Button */}
                <TouchableOpacity
                  style={styles.paymentBtn}
                  onPress={() => {
                    triggerHaptic.selection();
                    setActivePaymentLedger(item);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="card" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  <UrduText size={13} weight="bold" color="#FFFFFF">
                    {UrduStrings.billing.recordPaymentBtn}
                  </UrduText>
                </TouchableOpacity>

                {/* WhatsApp Button */}
                <TouchableOpacity
                  style={styles.whatsAppBtn}
                  onPress={() => handleWhatsAppSend(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="logo-whatsapp" size={17} color="#FFFFFF" style={{ marginLeft: 6 }} />
                  <UrduText size={13} weight="bold" color="#FFFFFF">
                    {UrduStrings.billing.sendWhatsAppBtn}
                  </UrduText>
                </TouchableOpacity>

                {/* Detail View Button */}
                <TouchableOpacity
                  style={styles.historyBtn}
                  onPress={() => router.push(`/customer/${item.customer_id}`)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 110 }}
      />

      {/* Payment Log Modal */}
      <PaymentModal
        visible={Boolean(activePaymentLedger)}
        ledger={activePaymentLedger}
        onClose={() => setActivePaymentLedger(null)}
        onSubmitPayment={async (customerId, amount, mode, notes) => {
          await recordPayment(customerId, amount, mode, notes);
          Alert.alert(UrduStrings.alerts.success, UrduStrings.payment.successMsg);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    minHeight: 64,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  titleColumn: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
  },
  summaryCardSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  filterTabsContainer: {
    flexDirection: 'row-reverse',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ledgerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  avatarKhata: {
    backgroundColor: Colors.primary,
  },
  avatarSpot: {
    backgroundColor: '#D97706',
  },
  customerNameBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  nameWithIcon: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
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
  metricsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  metricCol: {
    flex: 1,
    alignItems: 'center',
  },
  metricSeparator: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  balanceBanner: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 12,
  },
  balanceBannerDue: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  balanceBannerCleared: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  balanceBannerAdvance: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    gap: 8,
    alignItems: 'center',
  },
  paymentBtn: {
    flex: 2,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 9,
    borderRadius: 10,
  },
  whatsAppBtn: {
    flex: 2,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#25D366', // Official WhatsApp Green
    paddingVertical: 9,
    borderRadius: 10,
  },
  historyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
