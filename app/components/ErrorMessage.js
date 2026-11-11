
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Не удалось загрузить данные
      </Text>

      <Text style={styles.message}>{message}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onRetry}
      >
        <Text style={styles.buttonText}>
          Повторить попытку
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1E15',
    textAlign: 'center',
  },
  message: {
    color: '#8C937E',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#D4EF93',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 18,
  },
  buttonText: {
    color: '#1C1E15',
    fontWeight: '700',
  },
});

