import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Rect, Circle, G, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const LegendItem = ({ color, title, value }) => (
  <View style={styles.legendRow}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{title}: {value} ₽</Text>
  </View>
);

// Описание дуги для круговой диаграммы
const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', cx, cy,
    'L', start.x, start.y,
    'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
    'Z',
  ].join(' ');
};

const polarToCartesian = (cx, cy, r, angleDeg) => {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

export default function GraphScreen({ navigation, route }) {
  const { incomes = [], expenses = [] } = route.params || {};
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'pie'

  const parse = (str) => parseFloat(str?.toString().replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  const incSum = incomes.reduce((acc, i) => acc + parse(i.amount), 0);
  const expSum = expenses.reduce((acc, e) => acc + parse(e.amount), 0);
  const total = incSum + expSum;

  const chartWidth = width - 112;
  const incWidth = total > 0 ? (incSum / total) * chartWidth : 0;
  const incPercent = total > 0 ? Math.round((incSum / total) * 100) : 0;
  const expPercent = 100 - incPercent;

  // Геометрия круговой диаграммы
  const pieSize = Math.min(chartWidth, 220);
  const pieRadius = pieSize / 2;
  const pieCx = pieSize / 2;
  const pieCy = pieSize / 2;

  const incAngle = total > 0 ? (incSum / total) * 360 : 0;
  const expAngle = 360 - incAngle;

  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.innerFrame}>
          <Text style={styles.title}>Аналитика баланса</Text>

          {/* Переключатель типа диаграммы */}
          <View style={styles.switcher}>
            <TouchableOpacity
              style={[styles.switchBtn, chartType === 'bar' && styles.switchBtnActive]}
              onPress={() => setChartType('bar')}
            >
              <Text style={[styles.switchText, chartType === 'bar' && styles.switchTextActive]}>
                Столбцы
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchBtn, chartType === 'pie' && styles.switchBtnActive]}
              onPress={() => setChartType('pie')}
            >
              <Text style={[styles.switchText, chartType === 'pie' && styles.switchTextActive]}>
                Круг
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartBox}>
            {total === 0 ? (
              <Text style={styles.empty}>Нет данных для построения графиков</Text>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardHeader}>Соотношение бюджетов</Text>

                {chartType === 'bar' ? (
                  <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Svg width={chartWidth} height="36" viewBox={`0 0 ${chartWidth} 36`}>
                      {incSum > 0 && <Rect x="0" y="0" width={incWidth} height="36" fill="#D9EBAE" rx="8" ry="8" />}
                      {expSum > 0 && <Rect x={incWidth} y="0" width={chartWidth - incWidth} height="36" fill="#FFBABA" rx="8" ry="8" />}
                    </Svg>
                  </View>
                ) : (
                  <View style={{ marginTop: 20, alignItems: 'center' }}>
                    <Svg width={pieSize} height={pieSize}>
                      {incSum > 0 && expSum > 0 ? (
                        <G>
                          <Path d={describeArc(pieCx, pieCy, pieRadius, 0, incAngle)} fill="#D9EBAE" />
                          <Path d={describeArc(pieCx, pieCy, pieRadius, incAngle, 360)} fill="#FFBABA" />
                        </G>
                      ) : incSum > 0 ? (
                        <Circle cx={pieCx} cy={pieCy} r={pieRadius} fill="#D9EBAE" />
                      ) : (
                        <Circle cx={pieCx} cy={pieCy} r={pieRadius} fill="#FFBABA" />
                      )}
                      {/* Внутренний круг для эффекта "пончика" */}
                      <Circle cx={pieCx} cy={pieCy} r={pieRadius * 0.55} fill="#FFF" />
                    </Svg>
                    <Text style={styles.pieCenterText}>
                      {incPercent}% / {expPercent}%
                    </Text>
                  </View>
                )}

                <View style={styles.percentRow}>
                  <Text style={[styles.percentText, { color: '#2C3A00' }]}>{incPercent}% Доходы</Text>
                  <Text style={[styles.percentText, { color: '#610000' }]}>{expPercent}% Расходы</Text>
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

  // Переключатель
  switcher: {
    flexDirection: 'row',
    backgroundColor: '#EDF3D8',
    borderRadius: 14,
    padding: 4,
    marginTop: 12,
    alignSelf: 'center',
  },
  switchBtn: {
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 10,
  },
  switchBtnActive: {
    backgroundColor: '#1C1E15',
  },
  switchText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B6340',
  },
  switchTextActive: {
    color: '#F9FBF3',
  },

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
  btnBack: { backgroundColor: '#1C1E15', padding: 16, borderRadius: 16, alignItems: 'center', width: '100%' },

  // Круговая диаграмма
  pieCenterText: {
    position: 'absolute',
    top: '50%',
    marginTop: -10,
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1E15',
  },
});