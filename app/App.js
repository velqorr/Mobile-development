
import React, { useEffect } from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  Platform
} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import HomeScreen from './screens/HomeScreen';
import GraphScreen from './screens/GraphScreen';
import HistoryScreen from './screens/HistoryScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SearchResultsScreen from './screens/SearchResultsScreen';

import { useAuthStore } from './store/authStore';
import { useFinanceStore } from './store/financeStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const authHydrated = useAuthStore(
    (state) => state.hasHydrated
  );

  const financeHydrated = useFinanceStore(
    (state) => state.hasHydrated
  );

  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const configureNavigationBar = async () => {
      try {
        if (typeof NavigationBar.setBehaviorAsync === 'function') {
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        }

        if (typeof NavigationBar.setVisibilityAsync === 'function') {
          await NavigationBar.setVisibilityAsync('hidden');
        }
      } catch (error) {
        console.log('Navigation bar error:', error);
      }
    };

    configureNavigationBar();
  }, []);

  if (!authHydrated || !financeHydrated) {
    return (
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F9FBF3'
          }}
        >
          <ActivityIndicator size="large" color="#1C1E15" />

          <Text
            style={{
              marginTop: 15,
              color: '#1C1E15',
              fontSize: 14
            }}
          >
            Подготовка приложения...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          key={isAuthenticated ? 'app' : 'auth'}
          initialRouteName={isAuthenticated ? 'Home' : 'Login'}
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            contentStyle: {
              backgroundColor: '#F9FBF3'
            }
          }}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
              />

              <Stack.Screen
                name="Registration"
                component={RegistrationScreen}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
              />

              <Stack.Screen
                name="Graph"
                component={GraphScreen}
              />

              <Stack.Screen
                name="History"
                component={HistoryScreen}
              />

              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
              />

              <Stack.Screen
                name="SearchResults"
                component={SearchResultsScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
