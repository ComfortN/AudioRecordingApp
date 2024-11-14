import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const AudioContext = createContext();

// Custom hook for using the audio context
export const useAudio = () => useContext(AudioContext);

// Provider component
export const AudioProvider = ({ children }) => {
    const [voiceNotes, setVoiceNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadVoiceNotes = async () => {
        try {
            setIsLoading(true);
            const stored = await AsyncStorage.getItem('voiceNotes');
            if (stored) {
                setVoiceNotes(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading voice notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveVoiceNote = async (note) => {
        try {
            const newNotes = [...voiceNotes, note];
            await AsyncStorage.setItem('voiceNotes', JSON.stringify(newNotes));
            setVoiceNotes(newNotes);
        } catch (error) {
            console.error('Error saving voice note:', error);
        }
    };

    const deleteVoiceNote = async (id) => {
        try {
            console.log('Deleting voice note with id:', id);
            const newNotes = voiceNotes.filter(note => note.id !== id);
            console.log('New notes after filtering:', newNotes);
            await AsyncStorage.setItem('voiceNotes', JSON.stringify(newNotes));
            setVoiceNotes(newNotes);
        } catch (error) {
            console.error('Error deleting voice note:', error);
        }
    };

    const value = {
        voiceNotes,
        isLoading,
        loadVoiceNotes,
        saveVoiceNote,
        deleteVoiceNote,
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};