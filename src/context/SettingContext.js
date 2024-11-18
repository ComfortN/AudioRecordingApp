import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        highQualityRecording: true,
        autoSave: true,
        darkMode: false,
    });

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const storedSettings = await AsyncStorage.getItem('appSettings');
            if (storedSettings) {
                setSettings(JSON.parse(storedSettings));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const updateSettings = async (key, value) => {
        try {
            const newSettings = {
                ...settings,
                [key]: value
            };
            await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    };
  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
        {children}
    </SettingsContext.Provider>
  )
}
