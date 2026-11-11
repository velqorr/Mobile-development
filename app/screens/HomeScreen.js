
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, Image, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Modal, Animated, Dimensions, TextInput, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';

const { width } = Dimensions.get('window');
const SIDE_WIDTH = Math.min(width * 0.86, 380);

const C = {
  outer: '#D9EBAE', bg: '#F9FBF3', white: '#FFFFFF',
  text: '#1C1E15', muted: '#8C937E', accent: '#EDF4D4',
  green: '#D4EF93', greenSoft: '#E8F5E9', greenText: '#52752A',
  redSoft: '#FFEBEE', red: '#C65B5B', border: '#E9EEDC',
  input: '#F5F7F0',
};

const money = (v) => Number(v || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
const date = (v) => {
  if (!v) return '';
  const p = String(v).slice(0, 10).split('-');
  return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : v;
};

export default function HomeScreen({ navigation }) {
  const [menu, setMenu] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [type, setType] = useState('income');
  const [search, setSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  const transactions = useFinanceStore(s => s.transactions);
  const loadTransactions = useFinanceStore(s => s.loadTransactions);
  const addTransaction = useFinanceStore(s => s.addTransaction);
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  const slide = useRef(new Animated.Value(-SIDE_WIDTH)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (user?.id) loadTransactions(user.id);
  }, [user?.id, loadTransactions]);

  
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [fade]);

  const userTransactions = useMemo(
    () => transactions.filter(x => String(x.userId) === String(user?.id)),
    [transactions, user?.id]
  );
  const incomes = useMemo(() => userTransactions.filter(x => x.type === 'income'), [userTransactions]);
  const expenses = useMemo(() => userTransactions.filter(x => x.type === 'expense'), [userTransactions]);
  const sum = items => items.reduce((s, x) => s + Number(x.amount || 0), 0);
  const incomeTotal = sum(incomes);
  const expenseTotal = sum(expenses);
  const balance = incomeTotal - expenseTotal;
  const list = type === 'income' ? incomes : expenses;
  const sideTotal = type === 'income' ? incomeTotal : expenseTotal;
  const recent = userTransactions.slice(0, 1);

  const openSide = value => {
    setType(value);
    setSideOpen(true);
    slide.setValue(-SIDE_WIDTH);
    Animated.timing(slide, { toValue: 0, duration: 280, useNativeDriver: true }).start();
  };

  const closeSide = () => Animated.timing(slide, {
    toValue: -SIDE_WIDTH, duration: 220, useNativeDriver: true,
  }).start(() => setSideOpen(false));

  const handleAdd = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!user?.id || !amount.trim() || !desc.trim() || !Number.isFinite(value) || value <= 0) {
      Alert.alert('Проверьте данные', 'Введите сумму и описание.');
      return;
    }
    try {
      await addTransaction(user.id, { amount: String(value), desc: desc.trim(), type });
      setAmount('');
      setDesc('');
      setModal(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить операцию.');
    }
  };

  const openHistory = () => {
    setMenu(false);
    navigation.navigate('History', { incomes, expenses });
  };

  const openSearch = () => {
    if (search.trim()) navigation.navigate('SearchResults', {
      query: search.trim(), incomes, expenses,
    });
  };

  const handleLogout = () => {
    setMenu(false);
    Alert.alert('Выход', 'Выйти из аккаунта?', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: logout },
    ]);
  };

  const Operation = ({ item, compact = false }) => {
    const income = item.type === 'income';
    return (
      <View style={compact ? styles.recentItem : styles.sideOperation}>
        <View style={[styles.operationIcon, { backgroundColor: income ? C.greenSoft : C.redSoft }]}>
          <Text style={[styles.operationIconText, { color: income ? C.greenText : C.red }]}>
            {income ? '↗' : '↘'}
          </Text>
        </View>
        <View style={styles.operationInfo}>
          <Text style={styles.operationName} numberOfLines={1}>{item.desc || 'Операция'}</Text>
          <Text style={styles.operationMeta} numberOfLines={1}>
            {compact ? (income ? 'Доход' : 'Расход') : item.category?.name || 'Другое'}
          </Text>
          {!compact && <Text style={styles.operationDate}>{[date(item.date), item.time].filter(Boolean).join(' · ')}</Text>}
        </View>
        <Text style={[styles.operationValue, { color: income ? C.greenText : C.red }]}>
          {income ? '+' : '−'}{money(item.amount)} ₽
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.outer}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.frame}>
          <Animated.View style={{ flex: 1, opacity: fade }}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
              <View style={styles.header}>
                <Text style={styles.logo}>MoneyFlow</Text>
                <TouchableOpacity style={styles.avatar} onPress={() => setMenu(true)}>
                  <Image source={require('../assets/profile.png')} style={styles.avatarImage} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchBox}>
                <Text style={styles.searchSymbol}>⌕</Text>
                <TextInput
                  style={styles.searchInput} placeholder="Поиск..."
                  placeholderTextColor={C.muted} value={search}
                  onChangeText={setSearch} onSubmitEditing={openSearch}
                  returnKeyType="search"
                />
                {!!search && <TouchableOpacity onPress={() => setSearch('')}><Text style={styles.clear}>×</Text></TouchableOpacity>}
              </View>

              <View style={styles.balanceCard}>
                <View style={styles.balanceTop}>
                  <Text style={styles.eyebrow}>ОБЩИЙ БАЛАНС</Text>
                  <View style={styles.rubleIcon}><Text style={styles.ruble}>₽</Text></View>
                </View>
                <Text style={styles.balanceValue}>{money(balance)} ₽</Text>
                <View style={styles.divider} />
                <View style={styles.balanceStats}>
                  <View><Text style={styles.muted}>Доходы</Text><Text style={styles.incomeValue}>+{money(incomeTotal)} ₽</Text></View>
                  <View style={styles.verticalDivider} />
                  <View><Text style={styles.muted}>Расходы</Text><Text style={styles.expenseValue}>−{money(expenseTotal)} ₽</Text></View>
                </View>
              </View>

              <TouchableOpacity style={styles.analytics} onPress={() => navigation.navigate('Graph', { incomes, expenses })}>
                <View style={styles.analyticsIcon}><Text style={styles.analyticsSymbol}>▥</Text></View>
                <Text style={styles.analyticsText}>Аналитика</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Мои финансы</Text>
              <View style={styles.statsRow}>
                {[
                  { key: 'income', label: 'Доходы', value: incomeTotal, count: incomes.length, style: styles.incomeCard, symbol: '↗' },
                  { key: 'expense', label: 'Расходы', value: expenseTotal, count: expenses.length, style: styles.expenseCard, symbol: '↘' },
                ].map(x => (
                  <TouchableOpacity key={x.key} style={[styles.statCard, x.style]} onPress={() => openSide(x.key)}>
                    <Text style={styles.statSymbol}>{x.symbol}</Text>
                    <Text style={styles.statLabel}>{x.label}</Text>
                    <Text style={styles.statValue}>{money(x.value)} ₽</Text>
                    <Text style={styles.statCount}>{x.count} операций</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.recentHeader}>
                <Text style={styles.sectionTitle}>Последняя операция</Text>
                <TouchableOpacity onPress={openHistory}><Text style={styles.showAll}>Все →</Text></TouchableOpacity>
              </View>

              {recent.length ? (
                <View style={styles.recentList}>
                  {recent.map((item, i) => <Operation key={item.id || i} item={item} compact />)}
                </View>
              ) : <View style={styles.empty}><Text style={styles.emptyText}>Нет операций</Text></View>}

              <TouchableOpacity style={styles.bottomAdd} onPress={() => { setType('expense'); setModal(true); }}>
                <Text style={styles.bottomAddText}>+ Добавить операцию</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </View>
      </SafeAreaView>

      <Modal visible={sideOpen} transparent animationType="none" onRequestClose={closeSide}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={closeSide} />
          <Animated.View style={[styles.sideSheet, { transform: [{ translateX: slide }] }]}>
            <View style={styles.sideHeader}>
              <View>
                <Text style={styles.sideTitle}>Операции</Text>
                <Text style={styles.sideSubtitle}>История ваших финансов</Text>
              </View>
              <TouchableOpacity style={styles.sideClose} onPress={closeSide}><Text style={styles.closeText}>×</Text></TouchableOpacity>
            </View>

            <View style={styles.sideTabs}>
              {['income', 'expense'].map(x => (
                <TouchableOpacity
                  key={x}
                  style={[styles.sideTab, type === x && (x === 'income' ? styles.incomeTabActive : styles.expenseTabActive)]}
                  onPress={() => setType(x)}
                >
                  <Text style={[styles.sideTabText, type === x && (x === 'income' ? styles.incomeTabTextActive : styles.expenseTabTextActive)]}>
                    {x === 'income' ? 'Доходы' : 'Расходы'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.sideSummary}>
              <Text style={styles.sideSummaryLabel}>{type === 'income' ? 'Всего получено' : 'Всего потрачено'}</Text>
              <Text style={[styles.sideSummaryValue, { color: type === 'income' ? C.greenText : C.red }]}>
                {type === 'income' ? '+' : '−'}{money(sideTotal)} ₽
              </Text>
              <Text style={styles.sideSummaryCount}>{list.length} операций</Text>
            </View>

            <View style={styles.sideListHeader}>
              <Text style={styles.sideListTitle}>Список операций</Text>
              <Text style={styles.sideListCount}>{list.length}</Text>
            </View>

            <ScrollView style={styles.sideScroll} contentContainerStyle={styles.sideScrollContent} showsVerticalScrollIndicator={false}>
              {list.length ? list.map((item, i) => <Operation key={item.id || i} item={item} />) : (
                <View style={styles.sideEmpty}>
                  <View style={styles.sideEmptyIcon}><Text style={styles.sideEmptySymbol}>{type === 'income' ? '↗' : '↘'}</Text></View>
                  <Text style={styles.sideEmptyTitle}>Пока нет операций</Text>
                  <Text style={styles.sideEmptyText}>Здесь появятся ваши {type === 'income' ? 'доходы' : 'расходы'}</Text>
                </View>
              )}
            
            </ScrollView>

            <View style={styles.sideActions}>
              <TouchableOpacity style={styles.addButton} onPress={() => setModal(true)}>
                <Text style={styles.addButtonText}>+ Добавить {type === 'income' ? 'доход' : 'расход'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
        <KeyboardAvoidingView style={styles.center} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>Новая операция</Text>
            <View style={styles.typeSelector}>
              {['income', 'expense'].map(x => (
                <TouchableOpacity key={x} style={[styles.typeOption, type === x && (x === 'income' ? styles.typeIncomeActive : styles.typeExpenseActive)]} onPress={() => setType(x)}>
                  <Text style={[styles.typeText, type === x && styles.typeTextActive]}>{x === 'income' ? 'Доход' : 'Расход'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput style={styles.input} placeholder="Сумма (₽)" placeholderTextColor={C.muted} keyboardType="decimal-pad" value={amount} onChangeText={setAmount} />
            <TextInput style={styles.input} placeholder="Описание" placeholderTextColor={C.muted} value={desc} onChangeText={setDesc} maxLength={80} />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModal(false)}><Text style={styles.cancelText}>Отмена</Text></TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleAdd}><Text style={styles.confirmText}>Сохранить</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={menu} transparent animationType="slide" onRequestClose={() => setMenu(false)}>
        <View style={styles.profileOverlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setMenu(false)} />
          <View style={styles.profileSheet}>
            <View style={styles.handle} />
            <Image source={require('../assets/profile.png')} style={styles.largeAvatar} />
            <Text style={styles.profileName}>{user?.name || 'Пользователь'}</Text>
            {!!user?.email && <Text style={styles.profileEmail}>{user.email}</Text>}
            <TouchableOpacity style={styles.profileButton} onPress={openHistory}>
              <Text style={styles.profileButtonText}>История операций</Text>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileButton, styles.logoutButton]} onPress={handleLogout}>
              <Text style={styles.logoutText}>Выйти из аккаунта</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeProfile} onPress={() => setMenu(false)}><Text style={styles.backText}>Закрыть</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { flex: 1, backgroundColor: C.outer, paddingHorizontal: 16 },
  safe: { flex: 1, width: '100%' },
  frame: { flex: 1, marginTop: 12, marginBottom: 10, padding: 16, borderRadius: 26, backgroundColor: C.bg, borderWidth: 1, borderColor: C.outer, overflow: 'hidden' },
  content: { paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  logo: { fontSize: 25, fontWeight: '800', color: C.text, letterSpacing: -0.8 },
  avatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', borderWidth: 2, borderColor: C.outer },
  avatarImage: { width: '100%', height: '100%' },
  searchBox: { height: 46, flexDirection: 'row', alignItems: 'center', backgroundColor: C.input, borderRadius: 14, paddingHorizontal: 13, borderWidth: 1, borderColor: C.border },
  searchSymbol: { fontSize: 24, color: C.muted, marginRight: 8 },
  searchInput: { flex: 1, color: C.text, fontSize: 13, paddingVertical: 0 },
  clear: { fontSize: 22, color: C.muted, paddingHorizontal: 5 },
  balanceCard: { backgroundColor: C.white, borderRadius: 21, padding: 19, marginTop: 17, borderWidth: 1, borderColor: C.border, elevation: 2, shadowColor: '#000', shadowOpacity: 0.035, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  rubleIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  ruble: { color: C.greenText, fontSize: 19, fontWeight: '800' },
  balanceValue: { color: C.text, fontSize: 30, fontWeight: '800', marginTop: 10 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 16 },
  balanceStats: { flexDirection: 'row', alignItems: 'center' },
  verticalDivider: { width: 1, height: 34, backgroundColor: C.border, marginHorizontal: 25 },
  muted: { color: C.muted, fontSize: 11, marginBottom: 5 },
  incomeValue: { color: C.greenText, fontSize: 14, fontWeight: '700' },
  expenseValue: { color: C.red, fontSize: 14, fontWeight: '700' },
  analytics: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.accent, borderRadius: 16, padding: 14, marginTop: 13 },
  analyticsIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#DCE9B9', alignItems: 'center', justifyContent: 'center' },
  analyticsSymbol: { color: C.greenText, fontSize: 22, fontWeight: '700' },
  analyticsText: { flex: 1, marginLeft: 12, color: C.text, fontWeight: '700', fontSize: 14 },
  arrow: { color: C.greenText, fontSize: 20 },
  sectionTitle: { color: C.text, fontSize: 17, fontWeight: '800' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  statCard: { width: '48.2%', minHeight: 135, borderRadius: 17, padding: 13, borderWidth: 1 },
  incomeCard: { backgroundColor: C.greenSoft, borderColor: '#D9EBD9' },
  expenseCard: { backgroundColor: C.redSoft, borderColor: '#F3DEDE' },
  statSymbol: { fontSize: 21, fontWeight: '700', color: C.text },
  statLabel: { color: C.muted, fontSize: 12, marginTop: 8 },
  statValue: { color: C.text, fontSize: 16, fontWeight: '800', marginTop: 5 },
  statCount: { color: C.muted, fontSize: 10, marginTop: 5 },
  recentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 23, marginBottom: 11 },
  showAll: { color: C.greenText, fontSize: 11, fontWeight: '700' },
  recentList: { backgroundColor: C.white, borderRadius: 17, paddingHorizontal: 12, borderWidth: 1, borderColor: C.border },
  recentItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  operationIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  operationIconText: { fontSize: 19, fontWeight: '700' },
  operationInfo: { flex: 1, marginLeft: 10, marginRight: 5 },
  operationName: { color: C.text, fontSize: 12, fontWeight: '700' },
  operationMeta: { color: C.muted, fontSize: 10, marginTop: 4 },
  operationDate: { color: C.muted, fontSize: 9, marginTop: 3 },
  operationValue: { fontSize: 12, fontWeight: '800' },
  empty: { alignItems: 'center', backgroundColor: C.white, borderRadius: 17, padding: 22, borderWidth: 1, borderColor: C.border },
  emptyText: { color: C.muted, fontSize: 12 },
  bottomAdd: { backgroundColor: C.text, borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 16 },
  bottomAddText: { color: C.white, fontSize: 13, fontWeight: '700' },
  modalContainer: { flex: 1, flexDirection: 'row' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sideSheet: { position: 'absolute', left: 0, top: 0, width: SIDE_WIDTH, height: '100%', paddingTop: 48, backgroundColor: C.bg, borderTopRightRadius: 25, borderBottomRightRadius: 25, overflow: 'hidden' },
  sideHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  sideTitle: { color: C.text, fontSize: 22, fontWeight: '800' },
  sideSubtitle: { color: C.muted, fontSize: 11, marginTop: 4 },
  sideClose: { width: 34, height: 34, borderRadius: 12, backgroundColor: C.input, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: C.text, fontSize: 24, lineHeight: 27 },
  sideTabs: { flexDirection: 'row', marginHorizontal: 20, padding: 4, borderRadius: 13, backgroundColor: C.input, marginBottom: 15 },
  sideTab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 10 },
  sideTabText: { color: C.muted, fontSize: 12, fontWeight: '700' },
  incomeTabActive: { backgroundColor: C.greenSoft },
  expenseTabActive: { backgroundColor: C.redSoft },
  incomeTabTextActive: { color: C.greenText },
  expenseTabTextActive: { color: C.red },
  sideSummary: { marginHorizontal: 20, padding: 17, borderRadius: 17, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  sideSummaryLabel: { color: C.muted, fontSize: 11, fontWeight: '600' },
  sideSummaryValue: { fontSize: 25, fontWeight: '800', marginTop: 7 },
  sideSummaryCount: { color: C.muted, fontSize: 10, marginTop: 5 },
  sideListHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginTop: 22, marginBottom: 11 },
  sideListTitle: { color: C.text, fontSize: 13, fontWeight: '800' },
  sideListCount: { color: C.muted, fontSize: 11 },
  sideScroll: { flex: 1, paddingHorizontal: 20 },
  sideScrollContent: { paddingBottom: 12 },
  sideOperation: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white, borderWidth: 1, borderColor: C.border, padding: 12, borderRadius: 14, marginBottom: 9 },
  sideEmpty: { alignItems: 'center', paddingHorizontal: 15, paddingTop: 45 },
  sideEmptyIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  sideEmptySymbol: { color: C.greenText, fontSize: 25, fontWeight: '700' },
  sideEmptyTitle: { color: C.text, fontSize: 14, fontWeight: '800' },
  sideEmptyText: { color: C.muted, fontSize: 11, marginTop: 6, textAlign: 'center' },
  sideActions: { paddingHorizontal: 20, paddingTop: 13, paddingBottom: Platform.OS === 'ios' ? 28 : 18, borderTopWidth: 1, borderColor: C.border, backgroundColor: C.bg },
  addButton: { backgroundColor: C.text, borderRadius: 13, padding: 15, alignItems: 'center' },
  addButtonText: { color: C.white, fontSize: 13, fontWeight: '700' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.48)', padding: 20 },
  form: { width: '100%', maxWidth: 420, backgroundColor: C.bg, borderRadius: 24, padding: 22 },
  formTitle: { color: C.text, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 18 },
  typeSelector: { flexDirection: 'row', backgroundColor: C.input, borderRadius: 12, padding: 4, marginBottom: 16 },
  typeOption: { flex: 1, padding: 11, alignItems: 'center', borderRadius: 9 },
  typeIncomeActive: { backgroundColor: C.greenSoft },
  typeExpenseActive: { backgroundColor: C.redSoft },
  typeText: { color: C.muted, fontSize: 12, fontWeight: '600' },
  typeTextActive: { color: C.text, fontWeight: '800' },
  input: { backgroundColor: C.input, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 13, marginBottom: 12, color: C.text, fontSize: 14 },
  formActions: { flexDirection: 'row', marginTop: 5 },
  cancelButton: { flex: 1, backgroundColor: '#ECEFE5', borderRadius: 12, padding: 14, alignItems: 'center', marginRight: 6 },
  confirmButton: { flex: 1.4, backgroundColor: C.green, borderRadius: 12, padding: 14, alignItems: 'center', marginLeft: 6 },
  cancelText: { color: C.text, fontWeight: '600' },
  confirmText: { color: C.text, fontWeight: '800' },
  profileOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  profileSheet: { backgroundColor: C.bg, padding: 24, paddingBottom: 35, borderTopLeftRadius: 28, borderTopRightRadius: 28, alignItems: 'center' },
  handle: { width: 38, height: 4, borderRadius: 5, backgroundColor: C.outer, marginBottom: 19 },
  largeAvatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: C.outer, marginBottom: 11 },
  profileName: { color: C.text, fontSize: 18, fontWeight: '800' },
  profileEmail: { color: C.muted, fontSize: 12, marginTop: 4 },
  profileButton: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: C.input, borderRadius: 14, padding: 15, marginTop: 14 },
  profileButtonText: { color: C.text, fontWeight: '700', fontSize: 13 },
  logoutButton: { backgroundColor: C.redSoft, marginTop: 9 },
  logoutText: { color: C.red, fontWeight: '700', fontSize: 13 },
  closeProfile: { marginTop: 19, padding: 7 },
  backText: { color: C.muted, fontSize: 13, fontWeight: '600' },
});


