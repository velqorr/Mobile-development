import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useFinanceStore } from '../store/financeStore';
import { useAuthStore } from '../store/authStore';

export default function HistoryScreen({ navigation }) {
  const transactions = useFinanceStore((state) => state.transactions);
  const user = useAuthStore((state) => state.user);

  const allTransactions = useMemo(() => transactions
    .filter((item) => String(item.userId) === String(user?.id))
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)),
  [transactions, user?.id]);

  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.innerFrame}>
          <Text style={styles.title}>История операций</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginTop: 10 }}>
            {allTransactions.length === 0 ? (
              <Text style={styles.empty}>Операций пока нет</Text>
            ) : allTransactions.map((item) => (
              <View key={item.id} style={styles.historyCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.amount, { color: item.type === 'income' ? '#2E7D32' : '#C62828', fontSize: 16 }]}>
                    {item.type === 'income' ? '+ ' : '- '}{Number(item.amount).toLocaleString('ru-RU')} ₽
                  </Text>
                  <Text style={styles.time}>{item.date} · {item.time}</Text>
                </View>
                <Text style={styles.desc}>{item.desc}</Text>
                <Text style={styles.category}>{item.category?.name || 'Другое'} · {item.status}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.btnBlack} onPress={() => navigation.goBack()}>
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
  historyCard: { backgroundColor: '#FFF', padding: 14, borderRadius: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4 },
  amount: { fontWeight: 'bold' },
  time: { fontSize: 11, color: '#999' },
  desc: { fontSize: 13, marginTop: 4, color: '#444' },
  category: { fontSize: 11, marginTop: 5, color: '#8C937E' },
  empty: { textAlign: 'center', color: '#8C937E', marginTop: 30 },
  btnBlack: { backgroundColor: '#1C1E15', padding: 16, borderRadius: 16, width: '100%', alignItems: 'center', marginTop: 10 }
});
