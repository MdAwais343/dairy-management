import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import { UrduText } from '../../components/UrduText';
import { UrduStrings } from '../../constants/urduStrings';
import { DailyStatsBar } from '../../components/DailyStatsBar';
import { CustomerPickupCard } from '../../components/CustomerPickupCard';
import { CapacityModal } from '../../components/CapacityModal';
import { useDairyStore, getTodayDateString } from '../../store/dairyStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { triggerHaptic } from '../../lib/haptics';

export default function DailyTakeawayScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCapacityModalVisible, setIsCapacityModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const customers = useDairyStore((state) => state.customers);
  const dailyPickups = useDairyStore((state) => state.dailyPickups);
  const dailyCapacity = useDairyStore((state) => state.dailyCapacity);
  const selectedDate = useDairyStore((state) => state.selectedDate);
  const isDemoMode = useDairyStore((state) => state.isDemoMode);
  
  const togglePickup = useDairyStore((state) => state.togglePickup);
  const updatePickupLiters = useDairyStore((state) => state.updatePickupLiters);
  const setDailyCapacity = useDairyStore((state) => state.setDailyCapacity);
  const fetchInitialData = useDairyStore((state) => state.fetchInitialData);
  const getDailyStats = useDairyStore((state) => state.getDailyStats);

  const logout = useAuthStore((state) => state.logout);
  const ownerProfile = useAuthStore((state) => state.ownerProfile);

  const handleLogout = () => {
    triggerHaptic.medium();
    Alert.alert(
      'لاگ آؤٹ',
      'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟',
      [
        { text: 'منسوخ', style: 'cancel' },
        {
          text: 'لاگ آؤٹ کریں',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const stats = getDailyStats(selectedDate);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic.selection();
    try {
      await fetchInitialData();
    } catch {}
    setRefreshing(false);
  };

  // Filter active customers with search query
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => c.is_active)
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.trim().toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query)
        );
      });
  }, [customers, searchQuery]);

  // Format today's date in pleasant Urdu
  const formattedToday = useMemo(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      weekday: 'long'
    };
    return today.toLocaleDateString('ur-PK', options);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="cow" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.titleColumn}>
            <UrduText size={19} weight="bold" color={Colors.primary} numberOfLines={1}>
              {UrduStrings.appName}
            </UrduText>
            <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
              {formattedToday}
            </UrduText>
          </View>
        </View>

        {/* Clean Logout Button on Left */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={16} color={Colors.danger} />
          <UrduText size={11} weight="medium" color={Colors.danger} style={{ marginRight: 4 }}>
            لاگ آؤٹ
          </UrduText>
        </TouchableOpacity>
      </View>

      {/* Main List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            {/* Top Stats Bar */}
            <DailyStatsBar
              capacity={stats.capacity}
              distributed={stats.distributed}
              remaining={stats.remaining}
              deliveredCount={stats.deliveredCount}
              totalCustomersCount={stats.totalCustomersCount}
              onEditCapacityPress={() => setIsCapacityModalVisible(true)}
            />

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder={UrduStrings.daily.searchPlaceholder}
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* List Heading Row */}
            <View style={styles.sectionHeaderRow}>
              <UrduText size={15} weight="bold" color={Colors.textDark}>
                گاہکوں کی فہرست ({filteredCustomers.length})
              </UrduText>
              <UrduText size={12} color={Colors.textMuted}>
                دودھ فراہمی درج کریں
              </UrduText>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const pickup = dailyPickups.find(
            (p) => p.customer_id === item.id && p.pickup_date === selectedDate
          );
          return (
            <CustomerPickupCard
              customer={item}
              pickup={pickup}
              onTogglePickup={(customerId, customLiters) => togglePickup(customerId, customLiters)}
              onUpdateLiters={(customerId, liters) => updatePickupLiters(customerId, liters)}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <UrduText size={15} color={Colors.textMuted} style={{ marginTop: 10 }}>
              {UrduStrings.daily.noCustomersFound}
            </UrduText>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 30 }}
      />

      {/* Daily Capacity Modal */}
      <CapacityModal
        visible={isCapacityModalVisible}
        currentCapacity={dailyCapacity}
        onClose={() => setIsCapacityModalVisible(false)}
        onSaveCapacity={async (newCapacity) => {
          await setDailyCapacity(newCapacity);
          Alert.alert(UrduStrings.alerts.success, UrduStrings.alerts.capacityUpdated);
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
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
    marginRight: 10,
  },
  titleColumn: {
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexShrink: 0,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginLeft: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    fontSize: 14,
    color: Colors.textDark,
    textAlign: 'right',
  },
  clearSearchBtn: {
    padding: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
