import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUserProfile, uploadProfileImage } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(user?.photoURL || null);
  
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      // Fallback for web
      alert(`${title}\n\n${message}`);
    } else {
      // Native Alert
      Alert.alert(title, message);
    }
  };
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image');
      console.log('Image picker error:', error);
    }
  };

  const handleSave = async () => {
    if (loading) return;
  
    setLoading(true);
    try {
      let photoURL = user?.photoURL;
      
      // Only attempt upload if there's a new image
      if (image && image !== user?.photoURL) {
        try {
          const uploadStartTime = Date.now();
          photoURL = await uploadProfileImage(image);
          
          // If upload takes too long, show a timeout error
          if (Date.now() - uploadStartTime > 30000) { // 30 seconds timeout
            throw new Error('Upload timed out. Please try again.');
          }
        } catch (uploadError) {
          showAlert(
            'Image Upload Failed',
            uploadError.message || 'Failed to upload image. Please try again.'
          );
          setLoading(false);
          return;
        }
      }
  
      // Proceed with profile update if image upload was successful or not needed
      await updateUserProfile({
        displayName,
        email,
        photoURL,
      });
  
      showAlert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Profile update error:', error);
      showAlert(
        'Error',
        'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person-circle" size={80} color={colors.primary} />
            )}
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color={colors.background} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your display name"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
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
  avatarButton: {
    position: 'relative',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  form: {
    padding: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
});