import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
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

export default function CustomersScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);

  const customers = useDairyStore((state) => state.customers);
  const addCustomer = useDairyStore((state) => state.addCustomer);
  const updateCustomer = useDairyStore((state) => state.updateCustomer);
  const deleteCustomer = useDairyStore((state) => state.deleteCustomer);

  const activeCustomers = useMemo(() => {
    return customers
      .filter((c) => c.is_active)
      .filter((c) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return c.name.toLowerCase().includes(q) || c.phone.includes(q);
      });
  }, [customers, searchQuery]);

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
            <UrduText size={19} weight="bold" color={Colors.primary} numberOfLines={1}>
              {UrduStrings.customers.title}
            </UrduText>
            <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
              کل فعال گاہک: {activeCustomers.length}
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
          return (
            <TouchableOpacity
              style={styles.customerCard}
              onPress={() => router.push(`/customer/${item.id}`)}
              activeOpacity={0.7}
            >
              {/* Top Row: Name, Phone & Type Badge */}
              <View style={styles.cardTopRow}>
                <View style={styles.nameBlock}>
                  <UrduText size={17} weight="bold" color={Colors.textDark}>
                    {item.name}
                  </UrduText>
                  <View style={styles.phoneRow}>
                    <Ionicons name="call-outline" size={13} color={Colors.textMuted} />
                    <UrduText size={12} color={Colors.textMuted} style={{ marginRight: 4 }}>
                      {item.phone}
                    </UrduText>
                  </View>
                </View>

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
                      ? UrduStrings.customerTypes.spot
                      : UrduStrings.customerTypes.khata}
                  </UrduText>
                </View>
              </View>

              {/* Middle Row: Rate & Default Liters */}
              <View style={styles.cardDetailsRow}>
                <View style={styles.detailCol}>
                  <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
                    {UrduStrings.customers.defaultLiters}
                  </UrduText>
                  <UrduText size={13} weight="bold" color={Colors.textDark} style={{ marginTop: 2 }}>
                    {item.default_liters.toFixed(1)} {UrduStrings.daily.litersUnit}
                  </UrduText>
                </View>

                <View style={styles.detailsDivider} />

                <View style={styles.detailCol}>
                  <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
                    {UrduStrings.customers.pricePerLiter}
                  </UrduText>
                  <UrduText size={13} weight="bold" color={Colors.primary} style={{ marginTop: 2 }}>
                    {item.price_per_liter} {UrduStrings.daily.rupeesUnit}
                  </UrduText>
                </View>

                <View style={styles.detailsDivider} />

                <View style={styles.detailCol}>
                  <UrduText size={11} color={Colors.textMuted} numberOfLines={1}>
                    روزانہ بل
                  </UrduText>
                  <UrduText size={13} weight="bold" color={Colors.successDark} style={{ marginTop: 2 }}>
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
        contentContainerStyle={{ paddingBottom: 40 }}
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
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
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
  customerCard: {
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
  cardTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
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
