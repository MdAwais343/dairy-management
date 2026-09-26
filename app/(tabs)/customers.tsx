import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { UrduText } from '../../components/UrduText';
import { UrduStrings } from '../../constants/urduStrings';
import { CustomerModal } from '../../components/CustomerModal';
import { useDairyStore } from '../../store/dairyStore';
import { Customer } from '../../types/database.types';
import { Ionicons } from '@expo/vector-icons';
import { triggerHaptic } from '../../lib/haptics';

type CustomerFilter = 'all' | 'khata' | 'spot';

export default function CustomersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CustomerFilter>('all');
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const customers = useDairyStore((state) => state.customers);
  const addCustomer = useDairyStore((state) => state.addCustomer);
  const updateCustomer = useDairyStore((state) => state.updateCustomer);
  const deleteCustomer = useDairyStore((state) => state.deleteCustomer);

  const activeAllCustomers = useMemo(() => customers.filter((c) => c.is_active), [customers]);

  const counts = useMemo(() => {
    let khata = 0;
    let spot = 0;
    for (const c of activeAllCustomers) {
      if (c.customer_type === 'khata') khata++;
      else spot++;
    }
    return { all: activeAllCustomers.length, khata, spot };
  }, [activeAllCustomers]);

  const activeCustomers = useMemo(() => {
    return activeAllCustomers
      .filter((c) => {
        if (activeFilter === 'khata') return c.customer_type === 'khata';
        if (activeFilter === 'spot') return c.customer_type === 'spot';
        return true;
      })
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return c.name.toLowerCase().includes(q) || c.phone.includes(q);
      });
  }, [activeAllCustomers, activeFilter, searchQuery]);

  const handleOpenAdd = () => {
    setCustomerToEdit(null);
    setIsCustomerModalVisible(true);
    triggerHaptic.selection();
  };

  const handleOpenEdit = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalVisible(true);
    triggerHaptic.selection();
  };

  const handleCall = (phone: string) => {
    triggerHaptic.selection();
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleDeleteConfirm = (customer: Customer) => {
    triggerHaptic.medium();
    Alert.alert(
      UrduStrings.customers.delete,
      `کیا آپ واقعی "${customer.name}" کو حذف کرنا چاہتے ہیں؟`,
      [
        { text: UrduStrings.customers.cancel, style: 'cancel' },
        {
          text: UrduStrings.customers.delete,
          style: 'destructive',
          onPress: async () => {
            await deleteCustomer(customer.id);
            Alert.alert(UrduStrings.alerts.success, UrduStrings.alerts.customerDeleted);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <View style={styles.headerIcon}>
            <Ionicons name="people" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.titleColumn}>
            <UrduText
              size={19}
              weight="bold"
              color={Colors.primary}
              numberOfLines={1}
              style={{ paddingTop: 3, paddingBottom: 2 }}
            >
              {UrduStrings.customers.title}
            </UrduText>
            <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
              کل فعال گاہک: {counts.all}
            </UrduText>
          </View>
        </View>

        {/* Add Customer Button */}
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleOpenAdd}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" style={{ marginLeft: 3 }} />
          <UrduText size={12} weight="bold" color="#FFFFFF">
            نیا گاہک
          </UrduText>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs: تمام, کھاتہ دار, سپاٹ */}
      <View style={styles.filterTabsContainer}>
        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'all' && styles.filterTabActive]}
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
            تمام گاہک ({counts.all})
          </UrduText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, activeFilter === 'khata' && styles.filterTabActive]}
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
          style={[styles.filterTab, activeFilter === 'spot' && styles.filterTabActive]}
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
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="گاہک تلاش کریں (نام یا فون نمبر)..."
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

      {/* Customer List */}
      <FlatList
        data={activeCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const initialChar = item.name.trim().charAt(0) || 'گ';
          const isSpot = item.customer_type === 'spot';

          return (
            <TouchableOpacity
              style={styles.customerCard}
              onPress={() => router.push(`/customer/${item.id}`)}
              activeOpacity={0.8}
            >
              {/* Top Row: Avatar, Name, Phone & Quick Actions */}
              <View style={styles.cardTopRow}>
                <View style={styles.avatarAndName}>
                  <View style={[styles.avatar, isSpot ? styles.avatarSpot : styles.avatarKhata]}>
                    <UrduText size={16} weight="bold" color="#FFFFFF">
                      {initialChar}
                    </UrduText>
                  </View>
                  <View style={styles.nameBlock}>
                    <UrduText size={17} weight="bold" color={Colors.textDark}>
                      {item.name}
                    </UrduText>
                    <View style={styles.phoneRow}>
                      <Ionicons name="call-outline" size={12} color={Colors.textMuted} />
                      <UrduText size={12} color={Colors.textMuted} style={{ marginRight: 3 }}>
                        {item.phone}
                      </UrduText>
                    </View>
                  </View>
                </View>

                {/* Direct Call Button + Type Badge */}
                <View style={styles.headerRightGroup}>
                  <TouchableOpacity
                    style={styles.actionCircleBtn}
                    onPress={() => handleCall(item.phone)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call" size={14} color={Colors.primary} />
                  </TouchableOpacity>

                  <View
                    style={[
                      styles.typeBadge,
                      isSpot ? styles.spotBadge : styles.khataBadge,
                    ]}
                  >
                    <UrduText
                      size={11}
                      weight="bold"
                      color={isSpot ? '#92400E' : Colors.primary}
                    >
                      {isSpot ? UrduStrings.customerTypes.spotShort : UrduStrings.customerTypes.khataShort}
                    </UrduText>
                  </View>
                </View>
              </View>

              {/* Middle Row: Rate & Default Liters */}
              <View style={styles.cardDetailsRow}>
                <View style={styles.detailCol}>
                  <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
                    {UrduStrings.customers.defaultLiters}
                  </UrduText>
                  <UrduText size={14} weight="bold" color={Colors.textDark} style={{ marginTop: 2 }}>
                    {item.default_liters.toFixed(1)} {UrduStrings.daily.litersUnit}
                  </UrduText>
                </View>

                <View style={styles.detailsDivider} />

                <View style={styles.detailCol}>
                  <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
                    {UrduStrings.customers.pricePerLiter}
                  </UrduText>
                  <UrduText size={14} weight="bold" color={Colors.primary} style={{ marginTop: 2 }}>
                    {item.price_per_liter} {UrduStrings.daily.rupeesUnit}
                  </UrduText>
                </View>

                <View style={styles.detailsDivider} />

                <View style={styles.detailCol}>
                  <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
                    روزانہ بل
                  </UrduText>
                  <UrduText size={14} weight="bold" color={Colors.successDark} style={{ marginTop: 2 }}>
                    {Math.round(item.default_liters * item.price_per_liter).toLocaleString('en-US')} روپے
                  </UrduText>
                </View>
              </View>

              {/* Action Buttons: Edit, Delete, View History */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.viewHistoryBtn}
                  onPress={() => router.push(`/customer/${item.id}`)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={15} color={Colors.primary} style={{ marginLeft: 4 }} />
                  <UrduText size={12} weight="bold" color={Colors.primary}>
                    تاریخچہ و کھاتہ دیکھیں
                  </UrduText>
                </TouchableOpacity>

                <View style={styles.rightIconsGroup}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleOpenEdit(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={16} color={Colors.primary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteConfirm(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={16} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ paddingBottom: 110 }}
      />

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        visible={isCustomerModalVisible}
        customerToEdit={customerToEdit}
        onClose={() => setIsCustomerModalVisible(false)}
        onSaveCustomer={async (customerData) => {
          if (customerToEdit) {
            await updateCustomer(customerToEdit.id, customerData);
            Alert.alert(UrduStrings.alerts.success, UrduStrings.alerts.customerUpdated);
          } else {
            await addCustomer(customerData);
            Alert.alert(UrduStrings.alerts.success, UrduStrings.alerts.customerAdded);
          }
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
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    flexShrink: 0,
  },
  filterTabsContainer: {
    flexDirection: 'row-reverse',
    paddingHorizontal: 14,
    paddingTop: 10,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 10,
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
  customerCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 14,
    marginBottom: 11,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  nameBlock: {
    flex: 1,
    alignItems: 'flex-end',
  },
  phoneRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 2,
  },
  headerRightGroup: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  actionCircleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
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
  cardDetailsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
  },
  cardActionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  viewHistoryBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 4,
  },
  rightIconsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: Colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
