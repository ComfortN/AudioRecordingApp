import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color={colors.primary} />
        </View>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.menuItem}
          onPress={() => navigation.navigate('EditProfile')}>
          <Ionicons name="person-outline" size={24} color={colors.text} />
          <Text style={styles.menuText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color={colors.text} />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={24} color={colors.error} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  email: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: colors.card,
    borderRadius: 8,
    marginBottom: theme.spacing.sm,
  },
  menuText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
});