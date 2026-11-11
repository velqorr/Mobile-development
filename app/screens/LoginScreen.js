
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
} from 'react-native';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import { loginUser } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (loading) return;

    setEmailError('');
    setPasswordError('');

    let invalid = false;

    if (!email.trim()) {
      setEmailError('Введите email');
      invalid = true;
    }

    if (!password) {
      setPasswordError('Введите пароль');
      invalid = true;
    }

    if (invalid) return;

    setLoading(true);

    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        setPasswordError(result.message);
        return;
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выполнить вход. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bgOuter}>
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={styles.innerFrame}>
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Image
                source={require('../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.title}>MoneyFlow</Text>
            </View>

            <AppInput
              label="Email / Логин"
              placeholder="example@mail.com"
              value={email}
              onChangeText={setEmail}
              error={emailError}
              keyboardType="email-address"
            />

            <AppInput
              label="Пароль"
              placeholder="Введите пароль"
              value={password}
              onChangeText={setPassword}
              error={passwordError}
              isPassword
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Registration')}
              style={styles.link}
            >
              <Text style={styles.linkText}>
                Нет аккаунта? Создать аккаунт
              </Text>
            </TouchableOpacity>

            <AppButton
              title={loading ? 'Вход...' : 'Войти'}
              onPress={handleLogin}
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bgOuter: {
    flex: 1,
    backgroundColor: '#D9EBAE',
    paddingHorizontal: 16,
  },
  innerFrame: {
    flex: 1,
    marginVertical: 10,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#F9FBF3',
    borderWidth: 1,
    borderColor: '#D9EBAE',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    paddingHorizontal: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 85,
    height: 85,
    marginBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1C1E15',
    letterSpacing: -0.5,
  },
  link: {
    marginVertical: 16,
    alignSelf: 'center',
  },
  linkText: {
    color: '#1C1E15',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});

