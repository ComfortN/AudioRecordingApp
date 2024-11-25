// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from './src/tabs/HomeScreen';
// import RecordScreen from './src/tabs/RecordScreen';
// import SettingsScreen from './src/tabs/SettingsScreen';
// import { AudioProvider } from './src/context/AudioContext';
// import { SettingsProvider } from './src/context/SettingContext';
// import { colors } from './src/constants/colors';
// import { Ionicons } from '@expo/vector-icons';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <AudioProvider>
//       <SettingsProvider>
//         <NavigationContainer>
//           <StatusBar style="light" />
//           <Stack.Navigator
//             screenOptions={{
//               headerStyle: {
//                 backgroundColor: colors.primary,
//               },
//               headerTintColor: colors.background,
//               headerTitleStyle: {
//                 fontWeight: 'bold',
//               },
//             }}
//           >
//             <Stack.Screen name="Home" component={HomeScreen} options={({ navigation }) => ({
//                 title: 'Voice Notes',
//                 headerRight: () => (
//                   <TouchableOpacity 
//                     onPress={() => navigation.navigate('Settings')}
//                     style={{ marginRight: 15 }}
//                   >
//                     <Ionicons name="settings-outline" size={24} color={colors.background} />
//                   </TouchableOpacity>
//                 ),
//               })}
//             />
//             <Stack.Screen name="Record" component={RecordScreen} options={{ title: 'Record Note' }} />
//             <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
//           </Stack.Navigator>
//         </NavigationContainer>
//         </SettingsProvider>
//       </AudioProvider>
//   );
// }




import { StatusBar } from 'expo-status-bar';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native'; // Added Alert
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/tabs/HomeScreen';
import RecordScreen from './src/tabs/RecordScreen';
import SettingsScreen from './src/tabs/SettingsScreen';
import LoginScreen from './src/tabs/LoginScreen';
import RegisterScreen from './src/tabs/RegisterScreen';
import ProfileScreen from './src/tabs/ProfileScreen';
import EditProfileScreen from './src/tabs/EditProfileScreen.';
import SplashScreen from './src/tabs/SplashScreen';
import { AudioProvider } from './src/context/AudioContext';
import { SettingsProvider } from './src/context/SettingContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { colors } from './src/constants/colors';
import { Ionicons } from '@expo/vector-icons';

const Stack = createNativeStackNavigator();

function NavigationContent() {
  const { user, loading } = useAuth();
  const [isSplashComplete, setSplashComplete] = useState(false);

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
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
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
                    onPress={() => handleProfilePress(navigation)}
                    style={[styles.headerButton, styles.touchableFeedback]}
                    activeOpacity={0.5}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name="ellipsis-vertical" 
                        size={24} 
                        color={colors.background} 
                      />
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