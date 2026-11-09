import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getStatusConfig = (status) => {
  const configs = {
    pending: { bg: '#FFF9C4', text: '#F57F17', label: 'В ожидании' },
    in_progress: { bg: '#E3F2FD', text: '#0D47A1', label: 'В процессе' },
    completed: { bg: '#E8F5E9', text: '#2E7D32', label: 'Выполнено' },
    cancelled: { bg: '#FFEBEE', text: '#C62828', label: 'Отменено' },
  };
  return configs[status] || { bg: '#F5F5F5', text: '#616161', label: status };
};

export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 100, paddingVertical: 4, paddingHorizontal: 12, alignSelf: 'flex-start', justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
});
