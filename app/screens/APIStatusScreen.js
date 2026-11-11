
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import { getProducts } from '../services/apiService';
import ErrorMessage from '../components/ErrorMessage';

const C = {
  outer: '#D9EBAE',
  bg: '#F9FBF3',
  white: '#FFFFFF',
  text: '#1C1E15',
  muted: '#8C937E',
  green: '#D4EF93',
  border: '#E9EEDC',
};

export default function APIStatusScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const products = await getProducts();
      setData(products);
    } catch (err) {
      setData([]);

      setError(
        err.message === 'NETWORK_ERROR'
          ? 'Нет подключения к интернету. Проверьте сеть.'
          : 'Не удалось получить данные. Попробуйте ещё раз.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderProduct = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.productTitle}>{item.title}</Text>
      <Text style={styles.price}>{item.price} $</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Данные отсутствуют</Text>
    </View>
  );

  return (
    <View style={styles.outer}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.title}>Проверка API</Text>
          <Text style={styles.subtitle}>
            Состояние сетевого подключения
          </Text>

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={C.text} />
              <Text style={styles.status}>Загрузка данных...</Text>
            </View>
          ) : error ? (
            <View style={styles.center}>
              <ErrorMessage
                message={error}
                onRetry={loadData}
              />
            </View>
          ) : (
            <>
              <Text style={styles.count}>
                Получено записей: {data.length}
              </Text>

              <FlatList
                data={data}
                renderItem={renderProduct}
                keyExtractor={(item) => String(item.id)}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={
                  data.length === 0 ? styles.emptyList : styles.list
                }
              />
            </>
          )}

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: C.outer,
    paddingHorizontal: 16,
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginVertical: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.outer,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: C.text,
  },
  subtitle: {
    color: C.muted,
    marginTop: 5,
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    color: C.muted,
    marginTop: 12,
  },
  count: {
    color: C.muted,
    marginBottom: 12,
  },
  list: {
    paddingBottom: 12,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.border,
  },
  productTitle: {
    color: C.text,
    fontWeight: '600',
  },
  price: {
    color: '#52752A',
    marginTop: 6,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: C.muted,
    fontSize: 15,
  },
  backButton: {
    backgroundColor: C.text,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  backText: {
    color: C.white,
    fontWeight: '700',
  },
});

