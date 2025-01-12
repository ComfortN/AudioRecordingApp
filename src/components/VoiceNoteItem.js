import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform, Modal, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { useSettings } from '../context/SettingContext';

export default function VoiceNoteItem({ note, onDelete, onEdit }) {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(note.title);
    const { settings } = useSettings();
    const currentTheme = settings.darkMode ? colors.dark : colors.light;

    // Initialize audio session when component mounts
    useEffect(() => {
        const initAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: true,
                    shouldDuckAndroid: true,
                });
            } catch (error) {
                console.error('Error initializing audio:', error);
            }
        };
        
        initAudio();
    }, []);

    // Cleanup effect
    useEffect(() => {
        return () => {
            const unloadSound = async () => {
                if (sound) {
                    await sound.unloadAsync();
                }
            };
            unloadSound();
        };
    }, [sound]);

    // Reset editedTitle when note changes
    useEffect(() => {
        setEditedTitle(note.title);
    }, [note.title]);

    const getAudioUri = async (uri) => {
        try {
            if (Platform.OS === 'web') {
                // If it's already a blob URL, validate it
                if (uri.startsWith('blob:')) {
                    try {
                        const response = await fetch(uri);
                        if (!response.ok) {
                            throw new Error('Invalid blob URL');
                        }
                        return uri;
                    } catch (error) {
                        console.error('Blob URL validation failed, attempting conversion:', error);
                        // If validation fails, try to recreate blob
                        if (note.audioData) {
                            const blob = await base64ToBlob(note.audioData);
                            return URL.createObjectURL(blob);
                        }
                    }
                }
                
                // If it's not a blob URL, attempt to create one
                const response = await fetch(uri);
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } else {
                // For native platforms, validate the file path
                if (uri.startsWith('file://')) {
                    const fileInfo = await FileSystem.getInfoAsync(uri);
                    if (!fileInfo.exists) {
                        throw new Error('Audio file not found');
                    }
                }
                return uri;
            }
        } catch (error) {
            console.error('Error getting audio URI:', error);
            throw error;
        }
    };

    const loadSound = async () => {
        try {
            // Unload any existing sound
            if (sound) {
                await sound.unloadAsync();
            }
    
            const audioUri = await getAudioUri(note.uri);
            
            const { sound: audioSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { 
                    shouldPlay: false,
                    progressUpdateIntervalMillis: 500 // Optional: for smoother progress tracking
                },
                onPlaybackStatusUpdate
            );
            
            setSound(audioSound);
    
            // Get and set the duration
            const status = await audioSound.getStatusAsync();
            if (status.isLoaded) {
                setDuration(status.durationMillis / 1000);
            }
    
            // Clean up object URL on web
            if (Platform.OS === 'web' && audioUri !== note.uri) {
                URL.revokeObjectURL(audioUri);
            }
    
            return audioSound;
        } catch (error) {
            console.error('Error loading sound:', error);
            Alert.alert('Error', 'Failed to load audio file');
            setSound(null);
            setIsPlaying(false);
            return null;
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis / 1000);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                // Reset sound position to start
                sound?.setPositionAsync(0).catch(console.error);
            }
        }
    };

    const onPlayPause = async () => {
        try {
            // Validate audio URI before attempting to play
            const audioUri = await getAudioUri(note.uri);
    
            // If no sound is loaded, load it first
            if (!sound) {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                
                setSound(newSound);
                setIsPlaying(true);
                return;
            }
    
            const status = await sound.getStatusAsync();
    
            if (!status.isLoaded) {
                // If sound is not loaded, reload and play
                const { sound: reloadedSound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                
                setSound(reloadedSound);
                setIsPlaying(true);
                return;
            }
    
            // If sound is already playing, pause it
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                // If sound was paused or just finished, reset and play
                if (status.positionMillis >= status.durationMillis) {
                    await sound.setPositionAsync(0);
                }
                await sound.playAsync();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Error playing/pausing:', error);
            Alert.alert('Error', 'Failed to play audio file');
            
            // Reset states on error
            setIsPlaying(false);
            setSound(null);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleDelete = async () => {
        console.log('Deleting note...');
        try {
            // Stop playback before deleting
            if (sound) {
                if (isPlaying) {
                    await sound.stopAsync();
                }
                await sound.unloadAsync();
                setSound(null);
                setIsPlaying(false);
            }
            
            // Platform-specific cleanup
            if (Platform.OS === 'web') {
                if (note.uri && note.uri.startsWith('blob:')) {
                    URL.revokeObjectURL(note.uri);
                }
            } else if (note.uri.startsWith('file://')) {
                await FileSystem.deleteAsync(note.uri, { idempotent: true });
            }
            console.log('Note deleted successfully');
            onDelete();
        } catch (error) {
            console.error('Error deleting file:', error);
            // Still proceed with the delete even if file deletion fails
            console.error('Error deleting file:', error);
            onDelete();
        }
    };

    const confirmDelete = () => {
        if (Platform.OS === 'web') {
            const isConfirmed = window.confirm('Are you sure you want to delete this voice note?');
            if (isConfirmed) {
                handleDelete();
            }
        } else {
            Alert.alert(
                'Delete Voice Note',
                'Are you sure you want to delete this voice note?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Delete',
                        onPress: handleDelete,
                        style: 'destructive',
                    },
                ]
            );
        }
    };
    

    const handleEdit = () => {
        if (editedTitle.trim() !== '') {
            onEdit(editedTitle);
            setIsEditing(false);
        }
    };

    const handleCloseModal = () => {
        setIsEditing(false);
    };

    return (
        <View style={[styles.container, { 
            backgroundColor: currentTheme.background,
            borderBottomColor: currentTheme.border 
        }]}>
            <TouchableOpacity 
                style={[styles.playButton, { backgroundColor: currentTheme.border }]} 
                onPress={onPlayPause}
            >
                <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={currentTheme.primary}
                />
            </TouchableOpacity>
            
            <View style={styles.noteInfo}>
                {isEditing ? (
                    <TextInput
                        style={[styles.titleInput, { 
                            color: currentTheme.primary,
                            borderColor: currentTheme.primary 
                        }]}
                        value={editedTitle}
                        onChangeText={setEditedTitle}
                    />
                ) : (
                    <Text style={[styles.title, { color: currentTheme.text }]}>
                        {note.title}
                    </Text>
                )}
                <View style={styles.detailsRow}>
                    <Text style={[styles.date, { color: currentTheme.textSecondary }]}>
                        {new Date(note.date).toLocaleDateString()}
                    </Text>
                    <Text style={[styles.duration, { color: currentTheme.textSecondary }]}>
                        {formatTime(isPlaying ? position : (note.duration || duration))}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(!isEditing)}
            >
                <Ionicons 
                    name="pencil" 
                    size={24} 
                    color={currentTheme.accent} 
                />
            </TouchableOpacity>

            <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={confirmDelete}
            >
                <Ionicons 
                    name="trash-outline" 
                    size={24} 
                    color={currentTheme.accent} 
                />
            </TouchableOpacity>

            <Modal visible={isEditing} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { 
                        backgroundColor: currentTheme.background 
                    }]}>
                        <TextInput 
                            style={[styles.modalInput, {
                                borderBottomColor: currentTheme.border,
                                color: currentTheme.text
                            }]}
                            value={editedTitle}
                            onChangeText={setEditedTitle}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={[styles.saveButton, { 
                                    backgroundColor: currentTheme.primary 
                                }]} 
                                onPress={handleEdit}
                            >
                                <Text style={[styles.saveButtonText, { 
                                    color: currentTheme.background 
                                }]}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.closeButton, { 
                                    backgroundColor: currentTheme.border 
                                }]} 
                                onPress={handleCloseModal}
                            >
                                <Text style={[styles.closeButtonText, { 
                                    color: currentTheme.text 
                                }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    noteInfo: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: theme.spacing.xs,
    },
    titleInput: {
        fontSize: 18,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        paddingVertical: 5,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        marginRight: theme.spacing.md,
    },
    duration: {
        fontSize: 12,
    },
    editButton: {
        padding: 10,
    },
    deleteButton: {
        padding: theme.spacing.sm,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: 300,
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalInput: {
        borderBottomWidth: 1,
        width: '100%',
        marginBottom: 20,
        fontSize: 18,
        paddingVertical: 5,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    saveButton: {
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
    },
    saveButtonText: {
        fontSize: 18,
    },
    closeButton: {
        padding: 10,
        marginLeft: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 18,
    },

});