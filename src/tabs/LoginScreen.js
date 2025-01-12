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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login, googleSignIn } = useAuth();
  const { settings } = useSettings();
  const currentTheme = settings.darkMode ? colors.dark : colors.light;
  

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
      navigation.replace('Record');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      navigation.replace('Record');
    } catch (error) {
      Alert.alert('Google Sign-In Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: currentTheme.background}]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: currentTheme.text}]}>Reflectory Voice Note</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textSecondary}]}>Login to your account</Text>

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
          style={[styles.loginButton, { backgroundColor: currentTheme.primary}]} 
          onPress={handleLogin}
        >
          <Text style={[styles.loginButtonText, { color: currentTheme.text}]}>Login</Text>
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: currentTheme.border}]} />
          <Text style={[styles.dividerText, { color: currentTheme.textSecondary}]}>OR</Text>
          <View style={[styles.dividerLine, { backgroundColor: currentTheme.text}]} />
        </View>

        <TouchableOpacity 
          style={[styles.googleButton, { backgroundColor: currentTheme.accent}]} 
          onPress={handleGoogleSignIn}
        >
          <Ionicons 
            name="logo-google" 
            size={24} 
            color={currentTheme.background} 
          />
          <Text style={[styles.googleButtonText, { color: currentTheme.text}]}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: currentTheme.textSecondary}]}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: currentTheme.text}]}>Register</Text>
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
  loginButton: {
    borderRadius: 8,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
  },
  googleButton: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
  },
  registerLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});