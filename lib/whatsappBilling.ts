import { Linking, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Customer, DailyPickup, Payment } from '../types/database.types';

export interface WhatsAppStatementData {
  customer: Customer;
  monthName: string; // e.g. "ستمبر 2026" or "September 2026"
  pickups: DailyPickup[];
  payments: Payment[];
}

/**
 * Format date from YYYY-MM-DD to DD/MM
 */
export const formatShortDate = (dateStr: string): string => {
  try {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      return `${parts[2]}/${parts[1]}`;
    }
  } catch {}
  return dateStr;
};

/**
 * Format currency with commas e.g. 14,400
 */
export const formatRupees = (amount: number): string => {
  return Math.round(amount).toLocaleString('en-US');
};

/**
 * Generates the official Urdu WhatsApp bill text according to the specification
 */
export const generateWhatsAppBillText = (data: WhatsAppStatementData): string => {
  const { customer, monthName, pickups, payments } = data;

  // Calculate totals
  const totalLiters = pickups.reduce((sum, p) => sum + Number(p.liters || 0), 0);
  const totalBill = pickups.reduce((sum, p) => sum + Number(p.total_amount || (p.liters * p.rate) || 0), 0);
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const balanceDue = totalBill - totalPaid;

  // Format Daily Pickups
  const sortedPickups = [...pickups].sort((a, b) => a.pickup_date.localeCompare(b.pickup_date));
  let pickupsText = '';
  if (sortedPickups.length > 0) {
    pickupsText = sortedPickups
      .map(p => `• ${formatShortDate(p.pickup_date)}: ${Number(p.liters).toFixed(1)} لیٹر (${formatRupees(p.total_amount || (p.liters * p.rate))} روپے)`)
      .join('\n');
  } else {
    pickupsText = '• اس ماہ میں کوئی دودھ نہیں لیا گیا۔';
  }

  // Format Payments
  const sortedPayments = [...payments].sort((a, b) => a.payment_date.localeCompare(b.payment_date));
  let paymentsText = '';
  if (sortedPayments.length > 0) {
    paymentsText = sortedPayments
      .map(p => `• ${formatShortDate(p.payment_date)}: ${formatRupees(p.amount)} روپے (${p.payment_mode || 'نقد'})`)
      .join('\n');
  } else {
    paymentsText = '• اس ماہ کوئی ادائیگی موصول نہیں ہوئی۔';
  }

  // Urdu status badge
  const balanceStatusBadge = balanceDue > 0 
    ? `🔴 *صاف واجب الادا رقم: ${formatRupees(balanceDue)} روپے*`
    : balanceDue < 0
    ? `🟢 *اضافی ایڈوانس رقم: ${formatRupees(Math.abs(balanceDue))} روپے*`
    : `✅ *صاف کھاتہ: تمام واجبات ادا ہیں (0 روپے)*`;

  const message = `📋 *ماہانہ کھاتہ و بل تفصیل*
👤 کسٹمر: ${customer.name}
🗓️ مہینہ: ${monthName}
--------------------------------
🥛 *دودھ کی روزانہ تفصیل:*
${pickupsText}
--------------------------------
کل دودھ: ${totalLiters.toFixed(1)} لیٹر
دودھ کا بل: ${formatRupees(totalBill)} روپے

💰 *وصول شدہ ادائیگیاں:*
${paymentsText}
--------------------------------
کل موصول شدہ: ${formatRupees(totalPaid)} روپے
--------------------------------
${balanceStatusBadge}

شکریہ!
*ڈیری مینجمنٹ*`;

  return message;
};

/**
 * Clean phone number for Pakistani WhatsApp (e.g. 03001234567 -> 923001234567)
 */
export const sanitizePakistaniPhone = (phone: string): string => {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned;
};

/**
 * Dispatches the WhatsApp message directly to the customer's phone number
 */
export const sendWhatsAppStatement = async (data: WhatsAppStatementData): Promise<void> => {
  try {
    const rawText = generateWhatsAppBillText(data);
    const encodedText = encodeURIComponent(rawText);
    const cleanPhone = sanitizePakistaniPhone(data.customer.phone);

    const whatsappAppUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodedText}`;
    const webWhatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;

    const canOpen = await Linking.canOpenURL(whatsappAppUrl);

    if (canOpen) {
      await Linking.openURL(whatsappAppUrl);
    } else {
      // Try web whatsapp
      const canOpenWeb = await Linking.canOpenURL(webWhatsAppUrl);
      if (canOpenWeb) {
        await Linking.openURL(webWhatsAppUrl);
      } else {
        Alert.alert(
          'واٹس ایپ ایپ موجود نہیں',
          'کیا آپ یہ بل ٹیکسٹ میسج یا کسی دوسری ایپ کے ذریعے شیئر کرنا چاہتے ہیں؟',
          [
            { text: 'منسوخ', style: 'cancel' },
            {
              text: 'شیئر کریں',
              onPress: async () => {
                const isAvailable = await Sharing.isAvailableAsync();
                if (isAvailable) {
                  // Fallback share via Web or system
                  await Linking.openURL(webWhatsAppUrl).catch(() => {});
                }
              }
            }
          ]
        );
      }
    }
  } catch (error) {
    Alert.alert('خرابی', 'واٹس ایپ پیغام بھیجنے میں مسئلہ پیش آیا ہے۔');
  }
};
