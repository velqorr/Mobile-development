
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Alert,
  FlatList,
  ActivityIndicator
} from 'react-native';

import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';
import { getProducts } from '../services/apiService';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.8;

export default function HomeScreen({ navigation }) {
  const [menu, setMenu] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [type, setType] = useState('income');
  const [modal, setModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  // Сетевые данные
  const [products, setProducts] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  const transactions = useFinanceStore((state) => state.transactions);
  const loadTransactions = useFinanceStore((state) => state.loadTransactions);
  const addTransaction = useFinanceStore((state) => state.addTransaction);

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  // Загрузка финансовых операций
  useEffect(() => {
    if (user?.id) {
      loadTransactions(user.id);
    }
  }, [user?.id, loadTransactions]);

  // Получение реальных данных из API
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setApiLoading(true);
        setApiError(null);

        const data = await getProducts(10, 0);

        if (isMounted) {
          setProducts(data);
          console.log('[API] Получено записей:', data.length);
        }
      } catch (error) {
        console.error('[API] Ошибка:', error.message);

        if (isMounted) {
          setApiError(error.message);
        }
      } finally {
        if (isMounted) {
          setApiLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const userTransactions = useMemo(
    () => transactions.filter(
      (item) => String(item.userId) === String(user?.id)
    ),
    [transactions, user?.id]
  );

  const incomes = userTransactions.filter(
    (item) => item.type === 'income'
  );

  const expenses = userTransactions.filter(
    (item) => item.type === 'expense'
  );

  const balance =
    incomes.reduce((sum, item) => sum + Number(item.amount || 0), 0) -
    expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const list = type === 'income' ? incomes : expenses;

  const openSide = (selectedType) => {
    setType(selectedType);
    setSideOpen(true);
    slideAnim.setValue(-SIDEBAR_WIDTH);

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true
    }).start();
  };

  const closeSide = () => {
    Animated.timing(slideAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 220,
      useNativeDriver: true
    }).start(() => setSideOpen(false));
  };

  const handleAdd = async () => {
    const numericAmount = Number(amount.replace(',', '.'));

    if (
      !amount.trim() ||
      !desc.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      Alert.alert(
        'Проверьте данные',
        'Введите корректную сумму и описание.'
      );
      return;
    }

    await addTransaction(user.id, {
      amount,
      desc,
      type
    });

    setAmount('');
    setDesc('');
    setModal(false);
  };

  const handleLogout = () => {
    setMenu(false);

    Alert.alert(
      'Выход из аккаунта',
      'Вы действительно хотите выйти?',
      [
        {
          text: 'Отмена',
          style: 'cancel'
        },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => logout()
        }
      ]
    );
  };

  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.innerFrame}>
          <View style={styles.header}>
            <Text style={styles.logo}>MoneyFlow</Text>

            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => setMenu(true)}
              activeOpacity={0.7}
            >
              <Image
                source={require('../assets/profile.png')}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Поиск функций или истории..."
            placeholderTextColor="#8C937E"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={() =>
              searchText.trim() &&
              navigation.navigate('SearchResults', {
                query: searchText,
                incomes,
                expenses
              })
            }
          />

          <View style={styles.balanceCard}>
            <Text style={styles.lbl}>Общий баланс</Text>
            <Text style={styles.val}>
              {balance.toLocaleString('ru-RU')} ₽
            </Text>
          </View>

          <TouchableOpacity
            style={styles.btnMain}
            onPress={() =>
              navigation.navigate('Graph', { incomes, expenses })
            }
          >
            <Text style={styles.btnText}>
              Диаграмма и Аналитика →
            </Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.grid, { backgroundColor: '#E8F5E9' }]}
              onPress={() => openSide('income')}
            >
              <Text style={styles.gridT}>
                Доходы ({incomes.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.grid, { backgroundColor: '#FFEBEE' }]}
              onPress={() => openSide('expense')}
            >
              <Text style={styles.gridT}>
                Расходы ({expenses.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Данные, полученные из API */}
          <View style={styles.apiContainer}>
            <Text style={styles.apiTitle}>
              Данные из сети
            </Text>

            {apiLoading ? (
              <ActivityIndicator size="small" color="#1C1E15" />
            ) : apiError ? (
              <Text style={styles.apiError}>
                Ошибка загрузки: {apiError}
              </Text>
            ) : (
              <FlatList
                data={products}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <View style={styles.apiItem}>
                    <Text style={styles.apiItemTitle}>
                      {item.title}
                    </Text>
                    <Text style={styles.apiItemPrice}>
                      {item.price} $
                    </Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    Данные отсутствуют
                  </Text>
                }
                style={{ maxHeight: 180 }}
              />
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Боковая панель доходов и расходов */}
      <Modal
        visible={sideOpen}
        transparent
        animationType="none"
        onRequestClose={closeSide}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeSide}
          />

          <Animated.View
            style={[
              styles.sideSheet,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <Text style={styles.sideH}>
              {type === 'income'
                ? 'Потоки доходов'
                : 'Потоки расходов'}
            </Text>

            <ScrollView
              style={{ flex: 1, paddingHorizontal: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {list.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <Text
                    style={{
                      fontWeight: 'bold',
                      color: type === 'income' ? '#2E7D32' : '#C62828'
                    }}
                  >
                    {type === 'income' ? '+' : '-'} {item.amount} ₽
                  </Text>

                  <Text
                    style={{
                      fontSize: 13,
                      color: '#333',
                      marginTop: 2
                    }}
                  >
                    {item.desc}
                  </Text>
                </View>
              ))}

              {list.length === 0 && (
                <Text style={styles.emptyText}>
                  Пока нет записей
                </Text>
              )}
            </ScrollView>

            <View style={styles.sideRow}>
              <TouchableOpacity
                style={styles.addB}
                onPress={() => setModal(true)}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                  + Добавить
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={closeSide}
                style={styles.closeB}
              >
                <Text style={{ color: '#1C1E15', fontWeight: '600' }}>
                  Назад
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Добавление операции */}
      <Modal
        visible={modal}
        transparent
        animationType="fade"
        onRequestClose={() => setModal(false)}
      >
        <View style={styles.centerBg}>
          <View style={styles.box}>
            <Text style={styles.boxH}>Новая запись</Text>

            <TextInput
              style={styles.input}
              placeholder="Сумма (₽)"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#999"
            />

            <TextInput
              style={styles.input}
              placeholder="Описание"
              value={desc}
              onChangeText={setDesc}
              placeholderTextColor="#999"
            />

            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.act, { backgroundColor: '#F5F5F5' }]}
                onPress={() => setModal(false)}
              >
                <Text style={{ color: '#666' }}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.act, { backgroundColor: '#D4EF93' }]}
                onPress={handleAdd}
              >
                <Text style={{ color: '#1A3300', fontWeight: 'bold' }}>
                  ОК
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Меню профиля */}
      <Modal
        visible={menu}
        transparent
        animationType="slide"
        onRequestClose={() => setMenu(false)}
      >
        <View style={styles.popOverlay}>
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setMenu(false)}
          />

          <View style={styles.modalBottom}>
            <Image
              source={require('../assets/profile.png')}
              style={styles.largeProfileImage}
            />

            <Text style={styles.profileName}>
              {user?.name || 'Пользователь'}
            </Text>

            {user?.email && (
              <Text style={styles.profileEmail}>
                {user.email}
              </Text>
            )}

            <TouchableOpacity
              style={styles.popB}
              onPress={() => {
                setMenu(false);
                navigation.navigate('History', {
                  incomes,
                  expenses
                });
              }}
            >
              <Text style={styles.popT}>Открыть историю</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.popB, styles.logoutButton]}
              onPress={handleLogout}
            >
              <Text style={[styles.popT, styles.logoutText]}>
                Выйти из аккаунта
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMenu(false)}
              style={{ marginTop: 20 }}
            >
              <Text style={{ color: '#666' }}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bgOuter: {
    flex: 1,
    backgroundColor: '#D9EBAE',
    paddingHorizontal: 16
  },

  innerFrame: {
    flex: 1,
    marginTop: 22,
    marginBottom: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#F9FBF3',
    borderWidth: 1,
    borderColor: '#D9EBAE'
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10
  },

  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1E15'
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D9EBAE'
  },

  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },

  searchInput: {
    backgroundColor: '#F5F7F0',
    padding: 12,
    borderRadius: 14,
    fontSize: 14,
    color: '#1C1E15'
  },

  balanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 5
  },

  lbl: {
    fontSize: 12,
    color: '#8C937E',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },

  val: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#1C1E15'
  },

  btnMain: {
    backgroundColor: '#EDF4D4',
    padding: 16,
    borderRadius: 16,
    marginTop: 15,
    alignItems: 'center'
  },

  btnText: {
    fontWeight: '600',
    color: '#2C3A00',
    fontSize: 15
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    width: '100%'
  },

  grid: {
    width: '48%',
    height: 95,
    borderRadius: 18,
    padding: 16,
    justifyContent: 'flex-end',
    elevation: 1
  },

  gridT: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1E15'
  },

  apiContainer: {
    marginTop: 18,
    flex: 1
  },

  apiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1E15',
    marginBottom: 10
  },

  apiItem: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8
  },

  apiItemTitle: {
    fontSize: 14,
    color: '#1C1E15',
    fontWeight: '600'
  },

  apiItemPrice: {
    fontSize: 13,
    color: '#68852B',
    marginTop: 4
  },

  apiError: {
    color: '#C62828',
    fontSize: 13
  },

  modalContainer: {
    flex: 1,
    flexDirection: 'row'
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  sideSheet: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: '#FFF',
    paddingTop: 50,
    position: 'absolute',
    left: 0
  },

  sideH: {
    fontSize: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#1C1E15'
  },

  itemCard: {
    backgroundColor: '#F9FBF5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EDF2E1'
  },

  emptyText: {
    color: '#8C937E',
    textAlign: 'center',
    marginTop: 20
  },

  sideRow: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    marginBottom: 20
  },

  addB: {
    backgroundColor: '#1C1E15',
    padding: 14,
    borderRadius: 12,
    flex: 2,
    alignItems: 'center'
  },

  closeB: {
    flex: 1,
    alignItems: 'center'
  },

  centerBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },

  box: {
    width: '85%',
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 24
  },

  boxH: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },

  input: {
    backgroundColor: '#F5F7F0',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    color: '#1C1E15'
  },

  act: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5
  },

  popOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },

  menuBackdrop: {
    ...StyleSheet.absoluteFillObject
  },

  modalBottom: {
    backgroundColor: '#FFF',
    padding: 24,
    paddingBottom: 35,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    alignItems: 'center'
  },

  largeProfileImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 12
  },

  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1E15'
  },

  profileEmail: {
    fontSize: 13,
    color: '#8C937E',
    marginTop: 4,
    marginBottom: 12
  },

  popB: {
    backgroundColor: '#F5F7F0',
    padding: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 8
  },

  popT: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1E15'
  },

  logoutButton: {
    backgroundColor: '#FCEEEE'
  },

  logoutText: {
    color: '#C62828'
  }
});


