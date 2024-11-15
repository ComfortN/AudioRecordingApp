import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/tabs/HomeScreen';
import RecordScreen from './src/tabs/RecordScreen';
import { AudioProvider } from './src/context/AudioContext';
import { colors } from './src/constants/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AudioProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: colors.background,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Voice Notes' }} />
          <Stack.Screen name="Record" component={RecordScreen} options={{ title: 'Record Note' }} />
        </Stack.Navigator>
      </NavigationContainer>
      </AudioProvider>
  );
}

