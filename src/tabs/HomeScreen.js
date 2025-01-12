import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import VoiceNoteItem from '../components/VoiceNoteItem';
import { useAudio } from '../context/AudioContext';
import { SearchBar } from '../components/SearchBar';
import { useSettings } from '../context/SettingContext';

const HomeScreen = ({ navigation }) => {
    const { settings } = useSettings();
    const currentTheme = settings.darkMode ? colors.dark : colors.light;
    const { voiceNotes, isLoading, loadVoiceNotes, deleteVoiceNote, editVoiceNote } = useAudio();
    const [filteredNotes, setFilteredNotes] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
        loadVoiceNotes();
        });

        return unsubscribe;
    }, [navigation]);


    useEffect(() => {
        setFilteredNotes(voiceNotes);
    }, [voiceNotes]);


    const handleSearch = (query) => {
        if (!query.trim()) {
            setFilteredNotes(voiceNotes);
            return;
        }
        
        const filtered = voiceNotes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredNotes(filtered);
    };


    const handleDelete = async (id) => {
        const success = await deleteVoiceNote(id);
        if (success) {
            // Deletion was successful, update filtered notes immediately
            const newFilteredNotes = filteredNotes.filter(note => note.id !== id);
            setFilteredNotes(newFilteredNotes);
        }
    };


    return (
        <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={currentTheme.primary} />
                </View>
            ) : voiceNotes.length === 0 ? (
                <View style={styles.content}>
                    <Text style={[styles.title, { color: currentTheme.text }]}>Voice Note</Text>
                    <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>
                        Your personal audio journal
                    </Text>
                    <Text style={[styles.description, { color: currentTheme.text }]}>
                        Voice Note is a simple and easy-to-use voice recording app. Record your thoughts, ideas, or reminders on the go, and access them whenever you need them.
                    </Text>
                    
                    <TouchableOpacity
                        style={[styles.recordButton, { backgroundColor: currentTheme.accent }]}
                        onPress={() => navigation.navigate('Record')}
                    >
                        <Ionicons name="mic" size={24} color={currentTheme.background} />
                        <Text style={[styles.recordButtonText, { color: currentTheme.background }]}>
                            Start Recording
                        </Text>
                    </TouchableOpacity>
                    
                    <Text style={[styles.subtext, { color: currentTheme.textSecondary }]}>
                        Tap the microphone button to begin recording your first voice note.
                    </Text>
                </View>
            ) : (
                <>
                    <SearchBar onSearch={handleSearch} />
                    <FlatList
                        data={filteredNotes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <VoiceNoteItem
                                note={item}
                                onDelete={() => handleDelete(item.id)}
                                onEdit={(newTitle) => editVoiceNote(item.id, newTitle)}
                            />
                        )}
                        contentContainerStyle={styles.listContainer}
                    />
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: currentTheme.primary }]}
                        onPress={() => navigation.navigate('Record')}
                    >
                        <Ionicons name="mic" size={24} color={currentTheme.background} />
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: theme.spacing.sm
    },
    subtitle: {
        fontSize: 16,
        marginBottom: theme.spacing.lg,
    },
    description: {
        fontSize: 16,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingVertical: theme.spacing.md,
        marginVertical: theme.spacing.md,
    },
    recordButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: theme.spacing.sm,
    },
    subtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    listButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: theme.spacing.md,
    },
    listButtonText: {
        fontSize: 16,
        marginLeft: theme.spacing.sm,
    },
    listContainer: {
        paddingBottom: theme.spacing.xl,
    },
    fab: {
        position: 'absolute',
        right: theme.spacing.lg,
        bottom: theme.spacing.lg,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default HomeScreen;