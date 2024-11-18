import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { useSettings } from '../context/SettingContext';


export default function SettingsScreen() {
    const [highQualityRecording, setHighQualityRecording] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const { settings, updateSettings } = useSettings();


    // Load settings when component mounts
    React.useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const settings = await AsyncStorage.getItem('appSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                setHighQualityRecording(parsedSettings.highQualityRecording ?? true);
                setAutoSave(parsedSettings.autoSave ?? true);
                setDarkMode(parsedSettings.darkMode ?? false);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const saveSettings = async (key, value) => {
        try {
            const currentSettings = await AsyncStorage.getItem('appSettings');
            const parsedSettings = currentSettings ? JSON.parse(currentSettings) : {};
            const newSettings = {
                ...parsedSettings,
                [key]: value
            };
            await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
        } catch (error) {
            console.error('Error saving settings:', error);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const handleHighQualityChange = (value) => {
        setHighQualityRecording(value);
        updateSettings('highQualityRecording', value);
        saveSettings('highQualityRecording', value);
    };

    const handleAutoSaveChange = (value) => {
        setAutoSave(value);
        saveSettings('autoSave', value);
    };

    const handleDarkModeChange = (value) => {
        setDarkMode(value);
        saveSettings('darkMode', value);
    };

    const clearAllData = async () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to clear all voice notes? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem('voiceNotes');
                            Alert.alert('Success', 'All voice notes have been cleared');
                        } catch (error) {
                            console.error('Error clearing data:', error);
                            Alert.alert('Error', 'Failed to clear data');
                        }
                    }
                }
            ]
        );
    };

    const renderSettingItem = (icon, title, description, value, onValueChange) => (
        <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={24} color={colors.primary} />
                </View>
                <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{title}</Text>
                    <Text style={styles.settingDescription}>{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.background}
            />
        </View>
    );


    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recording Options</Text>
                {renderSettingItem(
                    'mic-outline',
                    'High Quality Recording',
                    'Record audio in high quality (uses more storage)',
                    highQualityRecording,
                    handleHighQualityChange
                )}
                {renderSettingItem(
                    'save-outline',
                    'Auto Save',
                    'Automatically save recordings when stopped',
                    autoSave,
                    handleAutoSaveChange
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Appearance</Text>
                {renderSettingItem(
                    'moon-outline',
                    'Dark Mode',
                    'Enable dark mode for the app',
                    darkMode,
                    handleDarkModeChange
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Data Management</Text>
                <TouchableOpacity style={styles.dangerButton} onPress={clearAllData}>
                    <Ionicons name="trash-outline" size={24} color={colors.background} />
                    <Text style={styles.dangerButtonText}>Clear All Voice Notes</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About</Text>
                <View style={styles.aboutContainer}>
                    <Text style={styles.version}>Version 1.0.0</Text>
                    <TouchableOpacity style={styles.linkButton}>
                        <Text style={styles.linkText}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linkButton}>
                        <Text style={styles.linkText}>Terms of Service</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    section: {
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: theme.spacing.md,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: theme.spacing.sm,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
        padding: theme.spacing.md,
        borderRadius: 8,
    },
    dangerButtonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: theme.spacing.sm,
    },
    aboutContainer: {
        alignItems: 'center',
    },
    version: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: theme.spacing.md,
    },
    linkButton: {
        paddingVertical: theme.spacing.sm,
    },
    linkText: {
        fontSize: 16,
        color: colors.primary,
    },
});