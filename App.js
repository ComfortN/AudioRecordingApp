import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSettings } from './src/context/SettingContext';
import HomeScreen from './src/tabs/HomeScreen';
import RecordScreen from './src/tabs/RecordScreen';
import SettingsScreen from './src/tabs/SettingsScreen';
import LoginScreen from './src/tabs/LoginScreen';
import RegisterScreen from './src/tabs/RegisterScreen';
import ProfileScreen from './src/tabs/ProfileScreen';
import EditProfileScreen from './src/tabs/EditProfileScreen.';
import SplashScreen from './src/tabs/SplashScreen';
import HelpSupportScreen from './src/tabs/HelpSupportScreen';
import { AudioProvider } from './src/context/AudioContext';
import { SettingsProvider } from './src/context/SettingContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

function NavigationContent() {
  const { user, loading } = useAuth();
  const { settings } = useSettings();
  const [isSplashComplete, setSplashComplete] = useState(false);

  const currentTheme = settings.darkMode ? colors.dark : colors.light;

  if (!isSplashComplete) {
    return <SplashScreen onFinish={() => setSplashComplete(true)} />;
  }

  if (loading) {
    return null;
  }

  const handleSettingsPress = (navigation) => {
    Alert.alert('Navigation', 'Attempting to navigate to Settings...');
    try {
      navigation.navigate('Settings');
    } catch (error) {
      Alert.alert('Error', `Navigation failed: ${error.message}`);
    }
  };

  const handleProfilePress = (navigation) => { 
    console.log('Profile button pressed'); 
    Alert.alert('Navigation', 'Attempting to navigate to Profile...'); 
    try { 
      navigation.navigate('Profile'); 

    } catch (error) { 
      Alert.alert('Error', `Navigation failed: ${error.message}`); 
      console.log(`Navigation error: ${error.message}`); 
    } 
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: currentTheme.primary,
        },
        headerTintColor: currentTheme.headerColor,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: currentTheme.background,
        },
      }}
    >
      {user ? (
        <>
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={({ navigation }) => ({
              title: 'Voice Notes',
              headerRight: () => (
                <View style={styles.headerButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('Navigating to Profile');
                      navigation.navigate('Profile');
                    }}
                    style={[styles.headerButton, styles.touchableFeedback]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                  <View style={styles.iconContainer}>
                    <Ionicons name="ellipsis-vertical" size={24} color={currentTheme.headerColor} />
                  </View>
                </TouchableOpacity>
                  
                </View>
              ),
            })}
          />
          <Stack.Screen 
            name="Record" 
            component={RecordScreen} 
            options={{ title: 'Record Note' }} 
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen} 
            options={{ title: 'Settings' }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ title: 'Profile' }} 
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen} 
            options={{ title: 'Edit Profile' }} 
          />
          <Stack.Screen
            name='HelpSupport'
            component={HelpSupportScreen}
            options={{ title: 'Help & Support' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ headerShown: false }} 
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginHorizontal: 8,
    padding: 8,
  },
  touchableFeedback: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  iconContainer: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <SettingsProvider>
          <NavigationContainer>
            <StatusBar style="light" />
            <NavigationContent />
          </NavigationContainer>
        </SettingsProvider>
      </AudioProvider>
    </AuthProvider>
  );
}