import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useAudio } from '../context/AudioContext';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

export default function RecordScreen({ navigation }) {
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const { saveVoiceNote } = useAudio();
    
    // Cleanup effect
    useEffect(() => {
        let intervalId;
        
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
            if (recording) {
                const cleanup = async () => {
                    try {
                        if (recording._isDoneRecording) {
                            await recording.stopAndUnloadAsync();
                        }
                    } catch (error) {
                        console.log('Cleanup error:', error);
                    }
                };
                cleanup();
            }
        };
    }, [recording]);

    const startRecording = async () => {
        try {
            if (Platform.OS !== 'web') {
                const permission = await Audio.requestPermissionsAsync();
                if (permission.status !== 'granted') {
                    Alert.alert('Permission Required', 'Please grant microphone permissions to record audio.');
                    return;
                }
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
            setDuration(0);

            // Start duration timer
            const interval = setInterval(() => {
                setDuration(d => d + 1);
            }, 1000);

            newRecording.setOnRecordingStatusUpdate(status => {
                if (!status.isRecording) {
                    clearInterval(interval);
                }
            });
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            if (!recording) {
                return;
            }

            setIsRecording(false);
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            
            if (!uri) {
                throw new Error('No recording URI available');
            }

            const note = {
                id: Date.now().toString(),
                title: `Voice Note ${new Date().toLocaleDateString()}`,
                uri,
                date: new Date().toISOString(),
                duration,
            };

            await saveVoiceNote(note);
            setRecording(null);
            navigation.goBack();
        } catch (err) {
            console.error('Failed to stop recording', err);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.durationContainer}>
                <Text style={styles.durationText}>
                    {formatDuration(duration)}
                </Text>
            </View>
            <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordingButton]}
                onPress={isRecording ? stopRecording : startRecording}
            >
                <Ionicons
                    name={isRecording ? 'stop' : 'mic'}
                    size={32}
                    color={colors.background}
                />
            </TouchableOpacity>
            <Text style={styles.helpText}>
                {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    durationContainer: {
        marginBottom: theme.spacing.xl,
    },
    durationText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: colors.primary,
    },
    recordButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    recordingButton: {
        backgroundColor: colors.accent,
    },
    helpText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
});