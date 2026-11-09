import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

const { width } = Dimensions.get('window');

const LegendItem = ({ color, title, value }) => (
  <View style={styles.legendRow}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{title}: {value} ₽</Text>
  </View>
);

export default function GraphScreen({ navigation, route }) {
  const { incomes = [], expenses = [] } = route.params || {};
  
  const parse = (str) => parseFloat(str?.toString().replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  const incSum = incomes.reduce((acc, i) => acc + parse(i.amount), 0);
  const expSum = expenses.reduce((acc, e) => acc + parse(e.amount), 0);
  const total = incSum + expSum;

  const chartWidth = width - 112;
  const incWidth = total > 0 ? (incSum / total) * chartWidth : 0;
  const incPercent = total > 0 ? Math.round((incSum / total) * 100) : 0;

  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.innerFrame}>
          <Text style={styles.title}>Аналитика баланса</Text>

          <View style={styles.chartBox}>
            {total === 0 ? (
              <Text style={styles.empty}>Нет данных для построения графиков</Text>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Соотношение бюджетов</Text>
                <View style={{ marginTop: 20, alignItems: 'center' }}>
                  <Svg width={chartWidth} height="36" viewBox={`0 0 ${chartWidth} 36`}>
                    {incSum > 0 && <Rect x="0" y="0" width={incWidth} height="36" fill="#D9EBAE" rx="8" ry="8" />}
                    {expSum > 0 && <Rect x={incWidth} y="0" width={chartWidth - incWidth} height="36" fill="#FFBABA" rx="8" ry="8" />}
                  </Svg>
                </View>
                <View style={styles.percentRow}>
                  <Text style={[styles.percentText, { color: '#2C3A00' }]}>{incPercent}% Доходы</Text>
                  <Text style={[styles.percentText, { color: '#610000' }]}>{100 - incPercent}% Расходы</Text>
                </View>
              </View>
            )}

            <View style={styles.legend}>
              <LegendItem color="#D9EBAE" title="Всего получено" value={incSum} />
              <LegendItem color="#FFBABA" title="Всего потрачено" value={expSum} />
            </View>
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
  title: { fontSize: 22, fontWeight: '800', color: '#1C1E15', textAlign: 'center' },
  chartBox: { flex: 1, justifyContent: 'center', width: '100%' },
  card: { backgroundColor: '#FFF', padding: 16, borderRadius: 20, elevation: 1, shadowOpacity: 0.01, shadowRadius: 3 },
  cardHeader: { fontSize: 15, fontWeight: '700', color: '#1C1E15', textAlign: 'center' },
  percentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  percentText: { fontSize: 13, fontWeight: '700' },
  empty: { textAlign: 'center', color: '#8C937E', fontSize: 15 },
  legend: { marginTop: 30, paddingHorizontal: 5 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  dot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  legendText: { fontSize: 15, fontWeight: '600', color: '#1C1E15' },
  btnBack: { backgroundColor: '#1C1E15', padding: 16, borderRadius: 16, alignItems: 'center', width: '100%' }
});
