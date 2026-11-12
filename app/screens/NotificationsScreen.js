
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getAppNotifications } from '../services/notifications';

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = useCallback(async () => {
    const data = await getAppNotifications();
    setNotifications(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const renderNotification = ({ item }) => {
    const formattedDate = new Date(item.date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    return (
      <View style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>✓</Text>
          </View>

          <View style={styles.notificationInfo}>
            <Text style={styles.notificationTitle}>
              {item.title}
            </Text>

            <Text style={styles.notificationDate}>
              {formattedDate}
            </Text>
          </View>
        </View>

        <Text style={styles.notificationMessage}>
          {item.message}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.innerFrame}>
          <Text style={styles.title}>Уведомления</Text>

          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={[
              styles.listContent,
              notifications.length === 0 && styles.emptyContainer,
            ]}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                Новых уведомлений нет
              </Text>
            }
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            style={styles.btnApi}
            onPress={() => navigation.navigate('APIStatus')}
          >
            <Text style={styles.btnApiText}>Проверить API</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnBackText}>
              ‹ Назад на Главную
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgOuter: {
    flex: 1,
    backgroundColor: '#D9EBAE',
    paddingHorizontal: 16,
  },
  safe: {
    flex: 1,
    width: '100%',
  },
  innerFrame: {
    flex: 1,
    marginVertical: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#F9FBF3',
    borderWidth: 1,
    borderColor: '#D9EBAE',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1E15',
    marginBottom: 10,
  },
  listContent: {
    paddingVertical: 8,
    gap: 12,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#8C937E',
    fontSize: 15,
  },
  notificationCard: {
    backgroundColor: '#F0F6E4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D9EBAE',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D4EF93',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#1C1E15',
    fontSize: 20,
    fontWeight: 'bold',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    color: '#1C1E15',
    fontSize: 15,
    fontWeight: '800',
  },
  notificationDate: {
    color: '#8C937E',
    fontSize: 12,
    marginTop: 3,
  },
  notificationMessage: {
    color: '#555C49',
    fontSize: 14,
    lineHeight: 20,
  },
  btnApi: {
    backgroundColor: '#D4EF93',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  btnApiText: {
    color: '#1C1E15',
    fontWeight: 'bold',
  },
  btnBack: {
    backgroundColor: '#1C1E15',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  btnBackText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});


