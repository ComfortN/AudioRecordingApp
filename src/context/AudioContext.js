import React, { createContext, useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Create the context
const AudioContext = createContext();

// Custom hook for using the audio context
export const useAudio = () => useContext(AudioContext);

// Provider component
export const AudioProvider = ({ children }) => {
    const [voiceNotes, setVoiceNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    // Convert blob to base64
    const blobToBase64 = async (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    // Convert base64 to blob
    const base64ToBlob = async (base64) => {
        try {
            const response = await fetch(base64);
            return await response.blob();
        } catch (error) {
            console.error('Error converting base64 to blob:', error);
            throw error;
        }
    };


    const loadVoiceNotes = async () => {
        try {
            setIsLoading(true);
            const stored = await AsyncStorage.getItem('voiceNotes');
            if (stored) {
                const parsedNotes = JSON.parse(stored);
                
                if (Platform.OS === 'web') {
                    const processedNotes = await Promise.all(
                        parsedNotes.map(async (note) => {
                            if (note.audioData) {
                                try {
                                    const blob = await base64ToBlob(note.audioData);
                                    const blobUrl = URL.createObjectURL(blob);
                                    return {
                                        ...note,
                                        uri: blobUrl,
                                    };
                                } catch (error) {
                                    console.error('Error processing note:', error);
                                    return null;
                                }
                            }
                            return note;
                        })
                    );
                    // Filter out any null entries from failed processing
                    setVoiceNotes(processedNotes.filter(note => note !== null));
                } else {
                    setVoiceNotes(parsedNotes);
                }
            }
        } catch (error) {
            console.error('Error loading voice notes:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const saveVoiceNote = async (note) => {
        try {
            let noteToSave = { ...note };

            if (Platform.OS === 'web') {
                // For web, convert blob URL to base64 for storage
                const response = await fetch(note.uri);
                const blob = await response.blob();
                const base64 = await blobToBase64(blob);
                noteToSave.audioData = base64;
            }

            const newNotes = [...voiceNotes, noteToSave];
            await AsyncStorage.setItem('voiceNotes', JSON.stringify(newNotes));
            
            if (Platform.OS === 'web') {
                // For immediate use, create a new blob URL
                const blob = await base64ToBlob(noteToSave.audioData);
                noteToSave.uri = URL.createObjectURL(blob);
            }
            
            setVoiceNotes([...voiceNotes, noteToSave]);
        } catch (error) {
            console.error('Error saving voice note:', error);
        }
    };

    const deleteVoiceNote = async (id) => {
        try {
            const noteToDelete = voiceNotes.find(note => note.id === id);
            if (!noteToDelete) {
                throw new Error('Note not found');
            }

            // For web, cleanup blob URL and revoke object URL
            if (Platform.OS === 'web') {
                if (noteToDelete.uri && noteToDelete.uri.startsWith('blob:')) {
                    URL.revokeObjectURL(noteToDelete.uri);
                }
            }

            // Remove from state first
            const newNotes = voiceNotes.filter(note => note.id !== id);
            setVoiceNotes(newNotes);

            // Then update storage
            await AsyncStorage.setItem('voiceNotes', JSON.stringify(
                newNotes.map(note => {
                    if (Platform.OS === 'web') {
                        // Keep the base64 data but don't store the blob URL
                        const { uri, ...noteWithoutUri } = note;
                        return noteWithoutUri;
                    }
                    return note;
                })
            ));

            return true;
        } catch (error) {
            console.error('Error deleting voice note:', error);
            return false;
        }
    };


    // Cleanup function for web platform
    const cleanup = () => {
        if (Platform.OS === 'web') {
            voiceNotes.forEach(note => {
                if (note.uri && note.uri.startsWith('blob:')) {
                    URL.revokeObjectURL(note.uri);
                }
            });
        }
    };

    React.useEffect(() => {
        loadVoiceNotes();
        return cleanup;
    }, []);


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