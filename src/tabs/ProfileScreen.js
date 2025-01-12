import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme'
import { useSettings } from '../context/SettingContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const currentTheme = settings.darkMode ? colors.dark : colors.light;
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchProfileImage();
  }, [user?.photoURL]);

  const fetchProfileImage = async () => {
    if (!user?.photoURL) {
      setLoading(false);
      return;
    }

    try {
      // Check if the photoURL is a Firestore reference
      if (user.photoURL.startsWith('firestore://')) {
        const docPath = user.photoURL.replace('firestore://', '');
        const [collection, docId] = docPath.split('/');
        
        const db = getFirestore();
        const docRef = doc(db, collection, docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileImage(data.photoURL);
        }
      } else {
        // If it's a direct URL
        setProfileImage(user.photoURL);
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Are you sure you want to logout?');
      if (confirm) {
        try {
          await logout();
        } catch (error) {
          window.alert(`Error: ${error.message}`);
        }
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                Alert.alert('Error', error.message);
              }
            },
          },
        ],
        { cancelable: true }
      );
    }
  };

  const renderAvatar = () => {
    if (loading) {
      return <Ionicons name="person-circle" size={80} color={currentTheme.primary} />;
    }

    if (profileImage) {
      return (
        <Image
          source={{ uri: profileImage }}
          style={styles.avatarImage}
          onError={() => {
            console.log('Error loading profile image');
            setProfileImage(null);
          }}
        />
      );
    }

    return <Ionicons name="person-circle" size={80} color={currentTheme.primary} />;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentTheme.background}]}>
      <View style={[styles.header, { borderBottomColor: currentTheme.border}]}>
        <View style={styles.avatarContainer}>
          {renderAvatar()}
        </View>
        <Text style={[styles.email, { color: currentTheme.text}]}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary}]}>Account</Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: currentTheme.card}]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="person-outline" size={24} color={currentTheme.text} />
          <Text style={[styles.menuText, { color: currentTheme.text}]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.textSecondary}]}>App</Text>
        
        <TouchableOpacity 
          style={[styles.menuItem, { backgroundColor: currentTheme.card}]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={currentTheme.text} />
          <Text style={[styles.menuText, { color: currentTheme.text}]}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, { backgroundColor: currentTheme.card}]}
          onPress={() => navigation.navigate('HelpSupport')}>
          <Ionicons name="help-circle-outline" size={24} color={currentTheme.text} />
          <Text style={[styles.menuText, { color: currentTheme.text}]}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color={currentTheme.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: currentTheme.card}]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={currentTheme.text} />
        <Text style={[styles.logoutText, { color: currentTheme.text}]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  email: {
    fontSize: 18,
    fontWeight: '500',
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
  menuText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
  },
});