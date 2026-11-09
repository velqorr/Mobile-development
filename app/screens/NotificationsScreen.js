import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function NotificationsScreen({ navigation }) {
  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.innerFrame}>
          <Text style={styles.title}>Уведомления</Text>
          
          <View style={styles.content}>
            <Text style={styles.emptyText}>Новых уведомлений нет</Text>
          </View>

          <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>‹ Назад на Главную</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgOuter: { flex: 1, backgroundColor: '#D9EBAE', paddingHorizontal: 16 },
  innerFrame: { flex: 1, marginVertical: 10, padding: 16, borderRadius: 24, backgroundColor: '#F9FBF3', borderWidth: 1, borderColor: '#D9EBAE' },
  title: { fontSize: 22, fontWeight: '800', color: '#1C1E15', marginBottom: 10 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#8C937E', fontSize: 15 },
  btnBack: { backgroundColor: '#1C1E15', padding: 16, borderRadius: 16, alignItems: 'center', width: '100%' }
});
