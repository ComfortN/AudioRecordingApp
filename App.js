import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/tabs/HomeScreen';
import RecordScreen from './src/tabs/RecordScreen';
import SettingsScreen from './src/tabs/SettingsScreen';
import { AudioProvider } from './src/context/AudioContext';
import { colors } from './src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

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
          <Stack.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({
              title: 'Voice Notes',
              headerRight: () => (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Settings')}
                  style={{ marginRight: 15 }}
                >
                  <Ionicons name="settings-outline" size={24} color={colors.background} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen name="Record" component={RecordScreen} options={{ title: 'Record Note' }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        </Stack.Navigator>
      </NavigationContainer>
      </AudioProvider>
  );
}

