import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import { registerUser } from '../database/auth';
import { useAuthStore } from '../store/authStore';
import { useFinanceStore } from '../store/financeStore';

export default function RegistrationScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [nameError, setNameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const loadTransactions = useFinanceStore((state) => state.loadTransactions);

  const handleRegister = async () => {
    if (loading) return;
    setEmailError('');
    setNameError('');
    setPasswordError('');

    let invalid = false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      setEmailError('Поле email не может быть пустым');
      invalid = true;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Некорректный формат email');
      invalid = true;
    }
    if (!name.trim()) {
      setNameError('Пожалуйста, введите ваше имя');
      invalid = true;
    }
    if (password.length < 6) {
      setPasswordError('Пароль должен быть не менее 6 символов');
      invalid = true;
    }
    if (invalid) return;

    setLoading(true);
    try {
      const result = await registerUser(email, name, password);
      if (!result.success) {
        setEmailError(result.message);
        return;
      }

      setUser(result.user);
      await loadTransactions(result.user.id);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать аккаунт');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.card}>
        <Text style={styles.title}>Регистрация</Text>
        <AppInput label="Email" placeholder="example@mail.com" value={email}
          onChangeText={setEmail} error={emailError} keyboardType="email-address" />
        <AppInput label="Имя" placeholder="Иван" value={name}
          onChangeText={setName} error={nameError} />
        <AppInput label="Пароль" placeholder="Минимум 6 символов" value={password}
          onChangeText={setPassword} error={passwordError} isPassword />
        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>Уже есть аккаунт? Войти</Text>
        </TouchableOpacity>
        <AppButton title={loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
          onPress={handleRegister} variant="primary" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#F9FBF3', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  card: { width: '100%', maxWidth: 360, padding: 24, backgroundColor: '#FFF', borderRadius: 24, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1E15', marginBottom: 20, textAlign: 'center' },
  link: { marginVertical: 14, alignSelf: 'center' },
  linkText: { color: '#1C1E15', textDecorationLine: 'underline', fontSize: 14 }
});
