import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function Background({ children }) {
  return (
    <View style={styles.container}>
      {/* Круги на фоне */}
      <View style={styles.circleTopLeft} />
      <View style={styles.circleBottomRight} />
      
      {/* Контент поверх фона */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FBF2',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  circleTopLeft: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(232, 245, 200, 0.6)',
  },
  circleBottomRight: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(232, 245, 200, 0.6)',
  },
});