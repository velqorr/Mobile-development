
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';

const EYE_ICON = require('../../assets/eye.png');

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  icon,
  isPassword = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  style,
  ...restProps
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const borderColor = error
    ? '#C62828'
    : isFocused
      ? '#1C1E15'
      : '#E0E5D5';

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}

      <View
        style={[
          styles.inputWrapper,
          { borderColor },
          multiline && {
            height: 40 * numberOfLines,
            alignItems: 'flex-start',
            paddingTop: 10
          }
        ]}
      >
        {icon ? (
          <View style={styles.leftIcon}>
            {icon}
          </View>
        ) : null}

        <TextInput
          {...restProps}
          style={[
            styles.input,
            multiline && { textAlignVertical: 'top' }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(previous => !previous)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'
            }
          >
            <Image
              source={EYE_ICON}
              style={styles.eyeImage}
              resizeMode="contain"
              fadeDuration={0}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C937E',
    marginBottom: 6,
    paddingLeft: 2
  },

  inputWrapper: {
    width: '100%',
    height: 52,
    backgroundColor: '#F5F7F0',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14
  },

  leftIcon: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },

  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1C1E15',
    padding: 0
  },

  eyeButton: {
    width: 36,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },

  eyeImage: {
    width: 24,
    height: 24
  },

  errorText: {
    color: '#C62828',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    paddingLeft: 2
  }
});
