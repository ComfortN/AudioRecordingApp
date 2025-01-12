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
import { useSettings } from '../context/SettingContext';
import { theme } from '../constants/theme';
import { doc, setDoc, getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(user?.photoURL || null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const { settings } = useSettings();
  const currentTheme = settings.darkMode ? colors.dark : colors.light;
  
  const db = getFirestore();

  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const resetFirestoreConnection = async () => {
    try {
      await disableNetwork(db);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      await enableNetwork(db);
    } catch (error) {
      console.error('Error resetting Firestore connection:', error);
    }
  };

  const storeImageInFirestore = async (base64Image) => {
    try {
      // Create a document in the 'user_profiles' collection
      const imageDocRef = doc(db, 'user_profiles', user.uid);  // You can use user.uid or another unique identifier
      await setDoc(imageDocRef, {
        photoURL: base64Image,
        createdAt: new Date(),
      });
  
      return imageDocRef.id; // Return the document ID for later use
    } catch (error) {
      console.error('Error storing image in Firestore:', error);
      throw new Error('Failed to store image in Firestore');
    }
  };

  const updateFirestoreProfile = async (userData) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        ...userData,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return true;
    } catch (error) {
      console.error('Firestore update error:', error);
      if (retryCount < MAX_RETRIES) {
        await resetFirestoreConnection();
        setRetryCount(prev => prev + 1);
        return false;
      }
      throw error;
    }
  };

  const updateUserProfileInAuth = async (imageDocId) => {
    try {
      // Firebase Authentication's photoURL will store the Firestore document reference
      const photoURL = `firestore://user_profiles/${imageDocId}`;
  
      // Update the user's Firebase Authentication profile with the Firestore reference
      await updateProfile(user, {
        displayName,
        photoURL, // Use the Firestore document reference here
      });
  
      showAlert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile in Firebase Auth:', error);
      showAlert('Error', 'Failed to update profile.');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert(
          'Permission Required',
          'Sorry, we need camera roll permissions to make this work!'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.1,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        // Check size before setting
        const sizeInBytes = Math.ceil((base64Image.length * 3) / 4);
        const sizeInMB = sizeInBytes / (1024 * 1024);
        
        if (sizeInMB > 0.85) { // Leave some room for other fields
          showAlert(
            'Image Too Large',
            'Please choose a smaller image or try again with a lower quality photo.'
          );
          return;
        }
        
        setImage(base64Image);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image');
      console.log('Image picker error:', error);
    }
  };

  const handleSave = async () => {
    if (loading) return;
  
    setLoading(true);
    setRetryCount(0); // Reset retry count
  
    try {
      // Prepare user data
      const userData = {
        displayName,
        email,
        lastUpdated: new Date().toISOString(),
      };
  
      // Upload image and get the Firestore document ID
      let imageDocId = image; // If no new image is picked, use the existing one.
      if (image && image.startsWith('data:image')) {
        imageDocId = await storeImageInFirestore(image);
      }
  
      // Update Firestore profile with the document reference ID
      userData.photoURL = `firestore://user_profiles/${imageDocId}`;
  
      // Try to update Firestore with retries
      let success = false;
      while (!success && retryCount < MAX_RETRIES) {
        success = await updateFirestoreProfile(userData);
        if (!success) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait between retries
        }
      }
  
      if (!success) {
        throw new Error('Failed to update profile after multiple attempts');
      }
  
      // Now update the Firebase Authentication profile with Firestore reference
      await updateUserProfileInAuth(imageDocId);
  
      showAlert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Profile update error:', error);
      
      let errorMessage = 'Failed to update profile. ';
      if (error.code === 'permission-denied') {
        errorMessage += 'You don\'t have permission to perform this action.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'The service is currently unavailable. Please check your internet connection.';
      } else {
        errorMessage += 'Please try again.';
      }
      
      showAlert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRetryCount(0);
    }
  };

  
  return (
    <ScrollView style={[styles.container, { 
      backgroundColor: currentTheme.background 
    }]}>
      <View style={[styles.header, { 
        borderBottomColor: currentTheme.border 
      }]}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
            {image ? (
              <Image 
                source={{ uri: image }} 
                style={styles.avatarImage}
                onError={() => {
                  console.log('Image load error');
                  setImage(null);
                }}
              />
            ) : (
              <Ionicons name="person-circle" size={80} color={currentTheme.primary} />
            )}
            <View style={[styles.editIconContainer, { 
              backgroundColor: currentTheme.primary,
              borderColor: currentTheme.background 
            }]}>
              <Ionicons name="camera" size={20} color={currentTheme.background} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentTheme.text }]}>
            Display Name
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.card,
              color: currentTheme.text 
            }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your display name"
            placeholderTextColor={currentTheme.textSecondary}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: currentTheme.text }]}>
            Email
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: currentTheme.card,
              color: currentTheme.text 
            }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={currentTheme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton, 
            { backgroundColor: currentTheme.primary },
            loading && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={currentTheme.accent} />
          ) : (
            <Text style={[styles.saveButtonText, { 
              color: currentTheme.background 
            }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
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
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  input: {
    borderRadius: 8,
    padding: theme.spacing.md,
    fontSize: 16,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
});