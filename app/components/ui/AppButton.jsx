import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, View } from 'react-native';

export default function AppButton({
  title,
  onPress,
  variant = 'primary', // primary | secondary | outline | danger
  size = 'md',        // sm | md | lg
  loading = false,
  disabled = false,
  leftIcon,
  style,
}) {
  const isActionDisabled = disabled || loading;

  // Динамический подбор стилей в зависимости от пропсов
  const buttonStyles = [
    styles.btn,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`text_${size}`],
    styles[`text_variant_${variant}`],
  ];

  const getLoaderColor = () => {
    if (variant === 'outline') return '#1C1E15';
    if (variant === 'secondary') return '#2C3A00';
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      onPress={isActionDisabled ? null : onPress}
      activeOpacity={0.7}
      disabled={isActionDisabled}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.iconWrapper}>{leftIcon}</View>}
          <Text style={textStyles}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 14, justifyContent: 'center', alignItems: 'center', width: '100%', flexDirection: 'row' },
  contentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  iconWrapper: { marginRight: 8 },
  disabled: { opacity: 0.5 },
  
  // Варианты внешнего вида (Варианты темы MoneyFlow)
  variant_primary: { backgroundColor: '#1C1E15' },
  variant_secondary: { backgroundColor: '#EDF4D4' },
  variant_outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#D9EBAE' },
  variant_danger: { backgroundColor: '#C62828' },
  
  // Текст для вариантов
  text_variant_primary: { color: '#FFFFFF' },
  text_variant_secondary: { color: '#2C3A00' },
  text_variant_outline: { color: '#1C1E15' },
  text_variant_danger: { color: '#FFFFFF' },

  // Размеры
  size_sm: { paddingVertical: 8, paddingHorizontal: 12 },
  size_md: { paddingVertical: 14, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 18, paddingHorizontal: 24 },

  // Стили текста
  text: { fontWeight: '600', textAlign: 'center' },
  text_sm: { fontSize: 13 },
  text_md: { fontSize: 15 },
  text_lg: { fontSize: 17 },
});
