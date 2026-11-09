import React from 'react';
import { TouchableOpacity, Text, Platform } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function StackNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right', 
        contentStyle: { backgroundColor: '#EAF5CD' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      
      <Stack.Screen 
        name="Registration" 
        component={RegistrationScreen} 
        options={({ navigation }) => ({
          headerShown: true,
          title: '',
          headerStyle: { backgroundColor: '#EAF5CD' },
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={{ paddingLeft: Platform.OS === 'ios' ? 0 : 16, paddingRight: 16 }}
            >
              <Text style={{ fontSize: 28, color: '#000' }}>←</Text>
            </TouchableOpacity>
          ),
        })}
      />

      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
    </Stack.Navigator>
  );
}