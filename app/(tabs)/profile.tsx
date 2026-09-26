import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { UrduText } from '../../components/UrduText';
import { UrduStrings } from '../../constants/urduStrings';
import { useAuthStore } from '../../store/authStore';
import { useDairyStore, getTodayDateString } from '../../store/dairyStore';
import { EditProfileModal } from '../../components/EditProfileModal';
import { CapacityModal } from '../../components/CapacityModal';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { triggerHaptic } from '../../lib/haptics';

export default function FarmProfileScreen() {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCapacityModalVisible, setIsCapacityModalVisible] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Auth Store
  const user = useAuthStore((state) => state.user);
  const ownerProfile = useAuthStore((state) => state.ownerProfile);
  const isDemoLogin = useAuthStore((state) => state.isDemoLogin);
  const logout = useAuthStore((state) => state.logout);
  const updateOwnerProfile = useAuthStore((state) => state.updateOwnerProfile);

  // Dairy Store
  const customers = useDairyStore((state) => state.customers);
  const dailyPickups = useDairyStore((state) => state.dailyPickups);
  const dailyCapacity = useDairyStore((state) => state.dailyCapacity);
  const payments = useDairyStore((state) => state.payments);
  const isDemoMode = useDairyStore((state) => state.isDemoMode);
  const fetchInitialData = useDairyStore((state) => state.fetchInitialData);
  const setDailyCapacity = useDairyStore((state) => state.setDailyCapacity);
  const getAllLedgers = useDairyStore((state) => state.getAllLedgers);

  // Stats calculation
  const activeCustomers = customers.filter((c) => c.is_active);
  const today = getTodayDateString();
  const todayPickups = dailyPickups.filter((p) => p.pickup_date === today);
  const todayDistributed = todayPickups.reduce((sum, p) => sum + Number(p.liters || 0), 0);

  const ledgers = getAllLedgers();
  const totalReceivable = ledgers.reduce((sum, l) => sum + Math.max(0, l.balance_due), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  // Handle Logout
  const handleLogout = () => {
    triggerHaptic.medium();
    Alert.alert(
      UrduStrings.profile.logout,
      UrduStrings.profile.confirmLogout,
      [
        { text: 'منسوخ', style: 'cancel' },
        {
          text: UrduStrings.profile.logout,
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // Handle Manual Cloud Sync
  const handleSync = async () => {
    triggerHaptic.selection();
    setSyncing(true);
    try {
      await fetchInitialData();
      triggerHaptic.success();
      Alert.alert(UrduStrings.alerts.success, UrduStrings.profile.syncSuccess);
    } catch {
      triggerHaptic.error();
      Alert.alert(UrduStrings.alerts.error, 'ڈیٹا سنک کرنے میں مسئلہ پیش آیا۔');
    } finally {
      setSyncing(false);
    }
  };

  // Handle Phone Call / WhatsApp
  const handleCall = () => {
    if (!ownerProfile?.phone) return;
    triggerHaptic.selection();
    Linking.openURL(`tel:${ownerProfile.phone}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextCol}>
          <UrduText size={20} weight="bold" color={Colors.textDark}>
            {UrduStrings.profile.title}
          </UrduText>
          <UrduText size={12} color={Colors.textMuted}>
            {UrduStrings.profile.subtitle}
          </UrduText>
        </View>

        {/* Sync Icon Button */}
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleSync}
          disabled={syncing}
          activeOpacity={0.7}
        >
          {syncing ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="cloud-done-outline" size={22} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Farm Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons name="cow" size={36} color={Colors.primary} />
            </View>
            <View style={styles.heroTitles}>
              <UrduText size={20} weight="bold" color="#FFFFFF">
                {ownerProfile?.farm_name || user?.user_metadata?.farm_name || 'ڈیری مینجمنٹ'}
              </UrduText>
              <UrduText size={14} color="#D1FAE5" style={{ marginTop: 2 }}>
                {ownerProfile?.owner_name || user?.user_metadata?.owner_name || (isDemoLogin ? 'ڈیمو فارم مالک' : (user?.email?.split('@')[0] || 'فارم مالک'))}
              </UrduText>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroDetails}>
            {/* Phone */}
            <TouchableOpacity
              style={styles.detailItem}
              onPress={handleCall}
              activeOpacity={0.7}
              disabled={!ownerProfile?.phone}
            >
              <Ionicons name="call-outline" size={16} color="#A7F3D0" />
              <UrduText size={13} color="#ECFDF5" style={{ marginLeft: 6 }}>
                {ownerProfile?.phone || 'موبائل نمبر درج نہیں'}
              </UrduText>
            </TouchableOpacity>

            {/* Email */}
            <View style={styles.detailItem}>
              <Ionicons name="mail-outline" size={16} color="#A7F3D0" />
              <UrduText size={13} color="#ECFDF5" style={{ marginLeft: 6 }}>
                {user?.email || 'owner@dairymanagement.pk'}
              </UrduText>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => {
              triggerHaptic.selection();
              setIsEditModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={16} color={Colors.primary} />
            <UrduText size={13} weight="bold" color={Colors.primary} style={{ marginRight: 6 }}>
              {UrduStrings.profile.editProfile}
            </UrduText>
          </TouchableOpacity>
        </View>

        {/* Farm Overview Stat Grid */}
        <View style={styles.sectionHeader}>
          <UrduText size={16} weight="bold" color={Colors.textDark}>
            {UrduStrings.profile.farmOverview}
          </UrduText>
        </View>

        <View style={styles.statGrid}>
          {/* Card 1: Daily Capacity */}
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => setIsCapacityModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.statIconBadge, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="water" size={20} color="#2563EB" />
            </View>
            <UrduText size={12} color={Colors.textMuted} style={styles.statLabel}>
              {UrduStrings.profile.dailyCapacity}
            </UrduText>
            <UrduText size={18} weight="bold" color={Colors.textDark}>
              {dailyCapacity} <UrduText size={12} color={Colors.textMuted}>لیٹر</UrduText>
            </UrduText>
            <UrduText size={10} color="#2563EB" style={{ marginTop: 2 }}>
              تبدیل کریں ✎
            </UrduText>
          </TouchableOpacity>

          {/* Card 2: Active Customers */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="people" size={20} color={Colors.primary} />
            </View>
            <UrduText size={12} color={Colors.textMuted} style={styles.statLabel}>
              {UrduStrings.profile.totalActiveCustomers}
            </UrduText>
            <UrduText size={18} weight="bold" color={Colors.textDark}>
              {activeCustomers.length} <UrduText size={12} color={Colors.textMuted}>گاہک</UrduText>
            </UrduText>
            <UrduText size={10} color={Colors.textMuted} style={{ marginTop: 2 }}>
              آج نکاسی: {todayDistributed} لیٹر
            </UrduText>
          </View>

          {/* Card 3: Total Outstanding */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="receipt" size={20} color="#DC2626" />
            </View>
            <UrduText size={12} color={Colors.textMuted} style={styles.statLabel}>
              {UrduStrings.profile.totalOutstanding}
            </UrduText>
            <UrduText size={16} weight="bold" color="#DC2626">
              ₨ {totalReceivable.toLocaleString()}
            </UrduText>
            <UrduText size={10} color="#DC2626" style={{ marginTop: 2 }}>
              واجب الادا کھاتہ
            </UrduText>
          </View>

          {/* Card 4: Total Collections */}
          <View style={styles.statCard}>
            <View style={[styles.statIconBadge, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="cash" size={20} color="#059669" />
            </View>
            <UrduText size={12} color={Colors.textMuted} style={styles.statLabel}>
              {UrduStrings.profile.totalCollections}
            </UrduText>
            <UrduText size={16} weight="bold" color="#059669">
              ₨ {totalPaid.toLocaleString()}
            </UrduText>
            <UrduText size={10} color="#059669" style={{ marginTop: 2 }}>
              کل موصولہ رقم
            </UrduText>
          </View>
        </View>

        {/* Farm Production Settings Card */}
        <View style={styles.sectionHeader}>
          <UrduText size={16} weight="bold" color={Colors.textDark}>
            ڈیری تفصیلات و معیارات
          </UrduText>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoRight}>
              <Ionicons name="pricetag-outline" size={18} color={Colors.primary} />
              <UrduText size={14} color={Colors.textDark} style={{ marginRight: 10 }}>
                معیاری ریٹ فی لیٹر
              </UrduText>
            </View>
            <UrduText size={14} weight="bold" color={Colors.primary}>
              240 روپے / لیٹر
            </UrduText>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoRight}>
              <MaterialCommunityIcons name="bottle-tonic-outline" size={18} color={Colors.primary} />
              <UrduText size={14} color={Colors.textDark} style={{ marginRight: 10 }}>
                پروڈکٹ کی قسم
              </UrduText>
            </View>
            <UrduText size={14} weight="medium" color={Colors.textMedium}>
              خالص گائے و بھینس کا دودھ
            </UrduText>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoRight}>
              <Ionicons name="speedometer-outline" size={18} color={Colors.primary} />
              <UrduText size={14} color={Colors.textDark} style={{ marginRight: 10 }}>
                روزانہ گنجائش (کوٹہ)
              </UrduText>
            </View>
            <TouchableOpacity
              onPress={() => setIsCapacityModalVisible(true)}
              style={styles.inlineActionBtn}
            >
              <UrduText size={13} weight="bold" color="#2563EB">
                {dailyCapacity} L (تبدیل کریں)
              </UrduText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cloud & Data Sync Card */}
        <View style={styles.sectionHeader}>
          <UrduText size={16} weight="bold" color={Colors.textDark}>
            {UrduStrings.profile.cloudSyncTitle}
          </UrduText>
        </View>

        <View style={styles.syncCard}>
          <View style={styles.syncCardRow}>
            <View style={styles.syncIconContainer}>
              <Ionicons
                name={isDemoMode || isDemoLogin ? 'cloud-offline' : 'cloud-done'}
                size={24}
                color={isDemoMode || isDemoLogin ? '#D97706' : Colors.primary}
              />
            </View>
            <View style={styles.syncCardText}>
              <UrduText size={14} weight="bold" color={Colors.textDark}>
                {isDemoMode || isDemoLogin
                  ? UrduStrings.profile.cloudStatusDemo
                  : UrduStrings.profile.cloudStatusOnline}
              </UrduText>
              <UrduText size={11} color={Colors.textMuted} style={{ marginTop: 2 }}>
                {isDemoMode || isDemoLogin
                  ? 'ڈیٹا صرف اس ڈیوائس پر محفوظ ہو رہا ہے'
                  : 'تمام گاہک، کوٹہ اور ادائیگیاں کلاؤڈ پر محفوظ ہیں'}
              </UrduText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.manualSyncBtn}
            onPress={handleSync}
            disabled={syncing}
            activeOpacity={0.8}
          >
            {syncing ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <View style={styles.manualSyncContent}>
                <Ionicons name="refresh" size={16} color={Colors.primary} />
                <UrduText size={13} weight="bold" color={Colors.primary} style={{ marginRight: 6 }}>
                  {UrduStrings.profile.syncNow}
                </UrduText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <UrduText size={15} weight="bold" color="#DC2626" style={{ marginRight: 8 }}>
            {UrduStrings.profile.logout}
          </UrduText>
        </TouchableOpacity>

        {/* App Version Info */}
        <View style={styles.footer}>
          <UrduText size={11} color={Colors.textMuted} style={{ textAlign: 'center' }}>
            {UrduStrings.profile.versionInfo}
          </UrduText>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={isEditModalVisible}
        profile={ownerProfile}
        onClose={() => setIsEditModalVisible(false)}
        onSave={async (updates) => {
          await updateOwnerProfile(updates);
          if (updates.default_capacity !== undefined) {
            await setDailyCapacity(updates.default_capacity);
          }
        }}
      />

      {/* Capacity Modal */}
      <CapacityModal
        visible={isCapacityModalVisible}
        currentCapacity={dailyCapacity}
        onClose={() => setIsCapacityModalVisible(false)}
        onSaveCapacity={async (cap) => {
          await setDailyCapacity(cap);
          await updateOwnerProfile({ default_capacity: cap });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTextCol: {
    flex: 1,
    alignItems: 'flex-end',
  },
  syncBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },
  heroCard: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
    elevation: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    marginBottom: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroTitles: {
    flex: 1,
    alignItems: 'flex-end',
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 14,
  },
  heroDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editProfileBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginTop: 14,
    elevation: 1,
  },
  sectionHeader: {
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    width: '48%',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    marginBottom: 4,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  inlineActionBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  syncCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  syncIconContainer: {
    marginLeft: 12,
  },
  syncCardText: {
    alignItems: 'flex-end',
    flex: 1,
  },
  manualSyncBtn: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  manualSyncContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 20,
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
  },
});
