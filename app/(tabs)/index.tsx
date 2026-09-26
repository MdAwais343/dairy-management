import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
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
import {
  useDairyStore,
  getTodayDateString,
  shiftDateString,
  formatUrduDate,
} from '../../store/dairyStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { triggerHaptic } from '../../lib/haptics';

type FilterType = 'all' | 'pending' | 'delivered' | 'khata' | 'spot';

export default function DailyTakeawayScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isCapacityModalVisible, setIsCapacityModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filterScrollRef = useRef<ScrollView>(null);
  const initialFilterScrolled = useRef(false);

  // By default, automatically scroll the filter chips to the right where "تمام" is located
  useEffect(() => {
    filterScrollRef.current?.scrollToEnd({ animated: false });
    const timer = setTimeout(() => {
      filterScrollRef.current?.scrollToEnd({ animated: false });
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const customers = useDairyStore((state) => state.customers);
  const dailyPickups = useDairyStore((state) => state.dailyPickups);
  const dailyCapacity = useDairyStore((state) => state.dailyCapacity);
  const selectedDate = useDairyStore((state) => state.selectedDate);
  const setSelectedDate = useDairyStore((state) => state.setSelectedDate);
  const isDemoMode = useDairyStore((state) => state.isDemoMode);
  
  const togglePickup = useDairyStore((state) => state.togglePickup);
  const updatePickupLiters = useDairyStore((state) => state.updatePickupLiters);
  const setDailyCapacity = useDairyStore((state) => state.setDailyCapacity);
  const fetchInitialData = useDairyStore((state) => state.fetchInitialData);
  const getDailyStats = useDairyStore((state) => state.getDailyStats);

  const logout = useAuthStore((state) => state.logout);

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
  const isViewingToday = selectedDate === getTodayDateString();

  // Date Navigator Handlers
  const handlePrevDay = () => {
    triggerHaptic.selection();
    const prevDate = shiftDateString(selectedDate, -1);
    setSelectedDate(prevDate);
  };

  const handleNextDay = () => {
    triggerHaptic.selection();
    const nextDate = shiftDateString(selectedDate, 1);
    setSelectedDate(nextDate);
  };

  const handleJumpToToday = () => {
    triggerHaptic.selection();
    setSelectedDate(getTodayDateString());
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    triggerHaptic.selection();
    try {
      await fetchInitialData();
    } catch {}
    setRefreshing(false);
  };

  // Active customers & deliveries for the active date
  const activeCustomers = useMemo(() => customers.filter((c) => c.is_active), [customers]);

  const deliveredCustomerIds = useMemo(() => {
    return new Set(
      dailyPickups
        .filter((p) => p.pickup_date === selectedDate)
        .map((p) => p.customer_id)
    );
  }, [dailyPickups, selectedDate]);

  // Compute live filter counts
  const counts = useMemo(() => {
    let delivered = 0;
    let pending = 0;
    let khata = 0;
    let spot = 0;

    for (const c of activeCustomers) {
      if (deliveredCustomerIds.has(c.id)) {
        delivered++;
      } else {
        pending++;
      }
      if (c.customer_type === 'khata') khata++;
      else spot++;
    }

    return {
      all: activeCustomers.length,
      delivered,
      pending,
      khata,
      spot,
    };
  }, [activeCustomers, deliveredCustomerIds]);

  // Filtered customers with search and category chip
  const filteredCustomers = useMemo(() => {
    return activeCustomers
      .filter((c) => {
        if (activeFilter === 'pending') {
          return !deliveredCustomerIds.has(c.id);
        }
        if (activeFilter === 'delivered') {
          return deliveredCustomerIds.has(c.id);
        }
        if (activeFilter === 'khata') {
          return c.customer_type === 'khata';
        }
        if (activeFilter === 'spot') {
          return c.customer_type === 'spot';
        }
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.trim().toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query)
        );
      });
  }, [activeCustomers, activeFilter, deliveredCustomerIds, searchQuery]);

  const formattedActiveDate = useMemo(() => {
    return formatUrduDate(selectedDate);
  }, [selectedDate]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="cow" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.titleColumn}>
            <UrduText
              size={19}
              weight="bold"
              color={Colors.primary}
              numberOfLines={1}
              style={{ paddingTop: 3, paddingBottom: 2 }}
            >
              {UrduStrings.appName}
            </UrduText>
            <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
              روزانہ دودھ کی فراہمی و تقسیم
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

      {/* Date Navigator Bar (Strictly 3 elements: Previous, Current Date, Next) */}
      <View style={styles.dateNavigator}>
        <TouchableOpacity
          style={styles.dateNavBtn}
          onPress={handlePrevDay}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-forward" size={17} color={Colors.primary} />
          <UrduText size={11} weight="medium" color={Colors.primary} style={{ marginRight: 2 }}>
            پچھلا دن
          </UrduText>
        </TouchableOpacity>

        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
          <UrduText size={12} weight="bold" color={Colors.primary}>
            {formattedActiveDate}
          </UrduText>
        </View>

        <TouchableOpacity
          style={styles.dateNavBtn}
          onPress={handleNextDay}
          activeOpacity={0.7}
        >
          <UrduText size={11} weight="medium" color={Colors.primary} style={{ marginLeft: 2 }}>
            اگلا دن
          </UrduText>
          <Ionicons name="chevron-back" size={17} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Responsive Jump to Today Banner (Appears only when viewing past or future dates) */}
      {!isViewingToday && (
        <TouchableOpacity
          style={styles.jumpTodayBanner}
          onPress={handleJumpToToday}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-undo" size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
          <UrduText size={11} weight="bold" color="#FFFFFF">
            واپس آج کا ریکارڈ دیکھیں ↩
          </UrduText>
        </TouchableOpacity>
      )}

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

            {/* Quick Filter Chips */}
            <ScrollView
              ref={filterScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: 1000, y: 0 }}
              onContentSizeChange={(contentWidth) => {
                if (contentWidth > 0 && !initialFilterScrolled.current) {
                  filterScrollRef.current?.scrollToEnd({ animated: false });
                  initialFilterScrolled.current = true;
                }
              }}
              contentContainerStyle={styles.filterScrollContainer}
            >
              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter('all');
                  triggerHaptic.selection();
                }}
              >
                <UrduText
                  size={12}
                  weight={activeFilter === 'all' ? 'bold' : 'medium'}
                  color={activeFilter === 'all' ? '#FFFFFF' : Colors.textMedium}
                >
                  تمام ({counts.all})
                </UrduText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  styles.filterChipPending,
                  activeFilter === 'pending' && styles.filterChipPendingActive,
                ]}
                onPress={() => {
                  setActiveFilter('pending');
                  triggerHaptic.selection();
                }}
              >
                <Ionicons
                  name="time-outline"
                  size={13}
                  color={activeFilter === 'pending' ? '#FFFFFF' : '#B45309'}
                  style={{ marginLeft: 3 }}
                />
                <UrduText
                  size={12}
                  weight={activeFilter === 'pending' ? 'bold' : 'medium'}
                  color={activeFilter === 'pending' ? '#FFFFFF' : '#B45309'}
                >
                  باقی ہیں ⏳ ({counts.pending})
                </UrduText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  styles.filterChipDelivered,
                  activeFilter === 'delivered' && styles.filterChipDeliveredActive,
                ]}
                onPress={() => {
                  setActiveFilter('delivered');
                  triggerHaptic.selection();
                }}
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={13}
                  color={activeFilter === 'delivered' ? '#FFFFFF' : Colors.successDark}
                  style={{ marginLeft: 3 }}
                />
                <UrduText
                  size={12}
                  weight={activeFilter === 'delivered' ? 'bold' : 'medium'}
                  color={activeFilter === 'delivered' ? '#FFFFFF' : Colors.successDark}
                >
                  لے گئے ✅ ({counts.delivered})
                </UrduText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'khata' && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter('khata');
                  triggerHaptic.selection();
                }}
              >
                <UrduText
                  size={12}
                  weight={activeFilter === 'khata' ? 'bold' : 'medium'}
                  color={activeFilter === 'khata' ? '#FFFFFF' : Colors.textMedium}
                >
                  کھاتہ دار ({counts.khata})
                </UrduText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, activeFilter === 'spot' && styles.filterChipActive]}
                onPress={() => {
                  setActiveFilter('spot');
                  triggerHaptic.selection();
                }}
              >
                <UrduText
                  size={12}
                  weight={activeFilter === 'spot' ? 'bold' : 'medium'}
                  color={activeFilter === 'spot' ? '#FFFFFF' : Colors.textMedium}
                >
                  نقد/سپاٹ ({counts.spot})
                </UrduText>
              </TouchableOpacity>
            </ScrollView>

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
              <UrduText size={11} color={Colors.textMuted}>
                {activeFilter === 'pending'
                  ? 'صرف باقی گاہک دکھائے جا رہے ہیں'
                  : activeFilter === 'delivered'
                  ? 'صرف فارغ گاہک دکھائے جا رہے ہیں'
                  : 'دودھ فراہمی و مقدار درج کریں'}
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
            <Ionicons name="checkmark-done-circle-outline" size={48} color={Colors.success} />
            <UrduText size={16} weight="bold" color={Colors.textDark} style={{ marginTop: 10 }}>
              {activeFilter === 'pending'
                ? 'ماشاءاللہ! تمام گاہک دودھ لے چکے ہیں 🎉'
                : UrduStrings.daily.noCustomersFound}
            </UrduText>
            <UrduText size={12} color={Colors.textMuted} style={{ marginTop: 4 }}>
              {activeFilter === 'pending'
                ? 'آج کی فراہمی مکمل ہو چکی ہے'
                : 'دیگر فلٹر یا تلاش تبدیل کریں'}
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
    marginRight: 10,
  },
  titleColumn: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
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
  dateNavigator: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dateNavBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: Colors.primarySoft,
  },
  dateBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  jumpTodayBanner: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterScrollContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  filterChipPendingActive: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  filterChipDelivered: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  filterChipDeliveredActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.successDark,
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
