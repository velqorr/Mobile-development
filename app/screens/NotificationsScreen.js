
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';

export default function NotificationsScreen({ navigation }) {
  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.innerFrame}>
          <Text style={styles.title}>Уведомления</Text>

          <View style={styles.content}>
            <Text style={styles.emptyText}>
              Новых уведомлений нет
            </Text>
          </View>

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
            <Text style={styles.btnBackText}>‹ Назад на Главную</Text>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#8C937E',
    fontSize: 15,
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

