import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

export default function VoiceNoteItem({ note, onDelete }) {
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [position, setPosition] = useState(0);

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
    

    return (
        <View style={styles.container}>
            <TouchableOpacity 
                style={styles.playButton} 
                onPress={onPlayPause}
            >
                <Ionicons
                    name={isPlaying ? 'pause' : 'play'}
                    size={24}
                    color={colors.primary}
                />
            </TouchableOpacity>
            
            <View style={styles.noteInfo}>
                <Text style={styles.title}>{note.title}</Text>
                <View style={styles.detailsRow}>
                    <Text style={styles.date}>
                        {new Date(note.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.duration}>
                        {formatTime(isPlaying ? position : (note.duration || duration))}
                    </Text>
                </View>
            </View>

            <TouchableOpacity 
                style={styles.deleteButton} 
                onPress={confirmDelete}
            >
                <Ionicons 
                    name="trash-outline" 
                    size={24} 
                    color={colors.accent} 
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.border,
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
        color: colors.text,
        marginBottom: theme.spacing.xs,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        color: colors.textSecondary,
        marginRight: theme.spacing.md,
    },
    duration: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    deleteButton: {
        padding: theme.spacing.sm,
    },
});