import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
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
            if (sound) {
                sound.unloadAsync().catch(console.error);
            }
        };
    }, [sound]);

    const getAudioUri = async (uri) => {
        if (Platform.OS === 'web') {
            try {
                // For web, we need to fetch the blob and create an object URL
                const response = await fetch(uri);
                const blob = await response.blob();
                return URL.createObjectURL(blob);
            } catch (error) {
                console.error('Error creating blob URL:', error);
                throw error;
            }
        }
        return uri; // Return original URI for native platforms
    };

    const loadSound = async () => {
        try {
            if (sound) {
                await sound.unloadAsync();
            }

            const audioUri = await getAudioUri(note.uri);
            
            const { sound: audioSound } = await Audio.Sound.createAsync(
                { uri: audioUri },
                { shouldPlay: false },
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
        } catch (error) {
            console.error('Error loading sound:', error);
            Alert.alert('Error', 'Failed to load audio file');
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
            if (!sound) {
                await loadSound();
                const audioUri = await getAudioUri(note.uri);
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUri },
                    { shouldPlay: true },
                    onPlaybackStatusUpdate
                );
                setSound(newSound);
                setIsPlaying(true);

                // Clean up object URL on web
                if (Platform.OS === 'web' && audioUri !== note.uri) {
                    URL.revokeObjectURL(audioUri);
                }
                return;
            }

            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                // If sound is not loaded, reload it
                await loadSound();
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
        // Stop playback before deleting
        if (sound && isPlaying) {
            await sound.stopAsync().catch(console.error);
        }
        
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
                    onPress: async () => {
                        if (sound) {
                            await sound.unloadAsync().catch(console.error);
                        }
                        onDelete();
                    },
                    style: 'destructive',
                },
            ]
        );
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
                onPress={handleDelete}
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