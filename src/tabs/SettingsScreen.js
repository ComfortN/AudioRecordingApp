import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { useSettings } from '../context/SettingContext';


export default function SettingsScreen() {
    const { settings, updateSettings } = useSettings();
    const [highQualityRecording, setHighQualityRecording] = useState(true);
    const [autoSave, setAutoSave] = useState(true);
    const [darkMode, setDarkMode] = useState(settings.darkMode);


    // Load settings when component mounts
    React.useEffect(() => {
        loadSettings();
    }, []);

    // Get current theme colors based on dark mode
    const currentTheme = darkMode ? colors.dark : colors.light;

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

    const handleSendFeedback = () => {
        Linking.openURL('mailto:support@reflectory.com?subject=App Feedback');
    };

    const handleGetSupport = () => {
        Linking.openURL('https://reflectory.com/support');
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
                <View style={[styles.iconContainer, {backgroundColor: currentTheme.border}]}>
                    <Ionicons name={icon} size={24} color={currentTheme.primary} />
                </View>
                <View style={styles.settingText}>
                    <Text style={[styles.settingTitle, {color: currentTheme.text}]}>{title}</Text>
                    <Text style={[styles.settingDescription, {color: currentTheme.textSecondary}]}>{description}</Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: currentTheme.border, true: currentTheme.primary }}
                thumbColor={currentTheme.background}
            />
        </View>
    );


    return (
        <ScrollView style={[styles.container, { backgroundColor: currentTheme.background}]}>
            <View style={[styles.section, {borderBottomColor: currentTheme.border}]}>
                <Text style={[styles.sectionTitle, {color: currentTheme.text}]}>Recording Options</Text>
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

            <View style={[styles.section, {borderBottomColor: currentTheme.border}]}>
                <Text style={[styles.sectionTitle, {color: currentTheme.text}]}>Appearance</Text>
                {renderSettingItem(
                    'moon-outline',
                    'Dark Mode',
                    'Enable dark mode for the app',
                    darkMode,
                    handleDarkModeChange
                )}
            </View>

            <View style={[styles.section, {borderBottomColor: currentTheme.border}]}>
                <Text style={[styles.sectionTitle, {color: currentTheme.text}]}>Data Management</Text>
                <TouchableOpacity style={[styles.dangerButton, {backgroundColor: currentTheme.accent}]} onPress={clearAllData}>
                    <Ionicons name="trash-outline" size={24} color={currentTheme.background} />
                    <Text style={[styles.dangerButtonText, { color: currentTheme.background}]}>Clear All Voice Notes</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.section, {borderBottomColor: currentTheme.border}]}>
                <Text style={[styles.sectionTitle, {color: currentTheme.text}]}>About</Text>
                <View style={styles.aboutContainer}>
                    <Text style={[styles.version, {color: currentTheme.textSecondary}]}>Version 1.0.0</Text>
                    <TouchableOpacity 
                    style={styles.supportButton}
                    onPress={handleSendFeedback}
                >
                    <Ionicons name="mail-outline" size={24} color={currentTheme.accent} />
                    <Text style={[styles.supportButtonText, { color: currentTheme.text }]}>Send Feedback</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.supportButton}
                    onPress={handleGetSupport}
                >
                    <Ionicons name="help-circle-outline" size={24} color={currentTheme.accent} />
                    <Text style={[styles.supportButtonText, { color: currentTheme.text }]}>Get Support</Text>
                </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: theme.spacing.md,
        borderBottomWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
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
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    settingText: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderRadius: 8,
    },
    dangerButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: theme.spacing.sm,
    },
    aboutContainer: {
        alignItems: 'center',
    },
    version: {
        fontSize: 16,
        marginBottom: theme.spacing.md,
    },
    supportButton: {
        alignItems: 'center',
        padding: theme.spacing.md,
        borderRadius: 8,
        marginBottom: theme.spacing.sm,
    },
    supportButtonText: {
        fontSize: 16,
        marginLeft: theme.spacing.sm,
    },

});