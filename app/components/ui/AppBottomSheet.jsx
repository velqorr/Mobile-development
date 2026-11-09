import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

export default function AppBottomSheet({ visible, onClose, title, children }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Клик на область вне шторки закрывает её */}
        <TouchableOpacity 
          style={styles.touchableClose} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <View style={styles.sheetContent}>
          {/* Верхняя полоса-индикатор свайпа */}
          <View style={styles.indicator} />
          
          <View style={styles.headerRow}>
            {title && <Text style={styles.title}>{title}</Text>}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.body}>
            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  touchableClose: { ...StyleSheet.absoluteFillObject },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    alignItems: 'center',
    maxHeight: '85%',
  },
  indicator: { width: 44, height: 5, backgroundColor: '#E0E5D5', borderRadius: 3, marginTop: 10, marginBottom: 15 },
  headerRow: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#1C1E15' },
  closeButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F7F0', justifyContent: 'center', alignItems: 'center' },
  closeText: { fontSize: 14, color: '#8C937E', fontWeight: 'bold' },
  body: { width: '100%' },
});
