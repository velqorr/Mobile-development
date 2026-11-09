import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from 'react-native';

export default function SearchResultsScreen({ navigation, route }) {
  
  const { query = '', incomes = [], expenses = [] } = route.params || {};

  
  const appFeatures = [
    { name: 'График аналитики', route: 'Graph' },
    { name: 'История операций', route: 'History' },
    { name: 'Уведомления', route: 'Notifications' }
  ];
  const foundFeatures = appFeatures.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));

  
  const allTransactions = [...incomes, ...expenses];
  const foundTransactions = allTransactions.filter(t => 
    t.desc.toLowerCase().includes(query.toLowerCase()) || 
    t.amount.toString().includes(query)
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Результаты для: "{query}"</Text>
      
      <ScrollView style={{ flex: 1, marginVertical: 15 }}>
        
        {foundFeatures.length > 0 && <Text style={styles.secTitle}>Разделы</Text>}
        {foundFeatures.map((f, i) => (
          <TouchableOpacity key={i} style={styles.btnNav} onPress={() => navigation.navigate(f.route, { incomes, expenses })}>
            <Text style={styles.btnNavText}>Перейти в: {f.name} →</Text>
          </TouchableOpacity>
        ))}

        
        {foundTransactions.length > 0 && <Text style={[styles.secTitle, { marginTop: 20 }]}>Транзакции</Text>}
        {foundTransactions.map(t => (
          <View key={t.id} style={styles.card}>
            <Text style={{ fontWeight: 'bold', color: t.type === 'income' ? '#2E7D32' : '#C62828' }}>
              {t.type === 'income' ? '+' : '-'} {t.amount} ₽
            </Text>
            <Text style={{ fontSize: 13, color: '#333' }}>{t.desc}</Text>
          </View>
        ))}

        {foundFeatures.length === 0 && foundTransactions.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#666', marginTop: 40 }}>Ничего не найдено</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>‹ Назад</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FBF3', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 20, fontWeight: '800', color: '#1C1E15' },
  secTitle: { fontSize: 12, fontWeight: 'bold', color: '#8C937E', textTransform: 'uppercase', marginBottom: 8 },
  btnNav: { backgroundColor: '#EDF4D4', padding: 14, borderRadius: 12, marginBottom: 8 },
  btnNavText: { fontWeight: '600', color: '#2C3A00' },
  card: { backgroundColor: '#FFF', padding: 14, borderRadius: 14, marginBottom: 10 },
  btnBack: { backgroundColor: '#1C1E15', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 }
});
