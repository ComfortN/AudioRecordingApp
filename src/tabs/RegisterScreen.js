import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { colors } from '../../src/constants/colors';
import { theme } from '../../src/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingContext';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { register } = useAuth();
  const { settings } = useSettings();
  const currentTheme = settings.darkMode ? colors.dark : colors.light;

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await register(email, password, displayName);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: currentTheme.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: currentTheme.text}]}>Voice Note</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textSecondary}]}>Create your account</Text>

        <View style={[styles.inputContainer, { borderColor: currentTheme.border}]}>
          <Ionicons 
            name="person-outline" 
            size={24} 
            color={currentTheme.textSecondary} 
            style={styles.icon} 
          />
          <TextInput
            style={[styles.input, { color: currentTheme.text}]}
            placeholder="Full Name"
            placeholderTextColor={currentTheme.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
        </View>

        <View style={[styles.inputContainer, { borderColor: currentTheme.border}]}>
          <Ionicons 
            name="mail-outline" 
            size={24} 
            color={currentTheme.textSecondary} 
            style={styles.icon} 
          />
          <TextInput
            style={[styles.input, { color: currentTheme.text}]}
            placeholder="Email"
            placeholderTextColor={currentTheme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { borderColor: currentTheme.border}]}>
          <Ionicons 
            name="lock-closed-outline" 
            size={24} 
            color={currentTheme.textSecondary} 
            style={styles.icon} 
          />
          <TextInput
            style={[styles.input, { color: currentTheme.text}]}
            placeholder="Password"
            placeholderTextColor={currentTheme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.visibilityToggle}
          >
            <Ionicons 
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color={currentTheme.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.registerButton, { backgroundColor: currentTheme.primary}]} 
          onPress={handleRegister}
        >
          <Text style={[styles.registerButtonText, { color: currentTheme.text}]}>Create Account</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: currentTheme.textSecondary}]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: currentTheme.text}]}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
  },
  visibilityToggle: {
    padding: theme.spacing.sm,
  },
  registerButton: {
    borderRadius: 8,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    // color: colors.textSecondary,
  },
  loginLink: {
    fontWeight: 'bold',
  },
});