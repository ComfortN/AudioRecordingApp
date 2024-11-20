import React, {useEffect, useState} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import VoiceNoteItem from '../components/VoiceNoteItem';
import { useAudio } from '../context/AudioContext';
import { SearchBar } from '../components/SearchBar';

const HomeScreen = ({ navigation }) => {
    const { voiceNotes, isLoading, loadVoiceNotes, deleteVoiceNote } = useAudio();
    const [filteredNotes, setFilteredNotes] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
        loadVoiceNotes();
        });

        return unsubscribe;
    }, [navigation]);


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
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : voiceNotes.length === 0 ? (
                <View style={styles.content}>
                    <Text style={styles.title}>Voice Note</Text>
                    <Text style={styles.subtitle}>Your personal audio journal</Text>
                    <Text style={styles.description}>
                        Voice Note is a simple and easy-to-use voice recording app. Record your thoughts, ideas, or reminders on the go, and access them whenever you need them.
                    </Text>
                    
                    <TouchableOpacity
                        style={styles.recordButton}
                        onPress={() => navigation.navigate('Record')}
                    >
                        <Ionicons name="mic" size={24} color={colors.background} />
                        <Text style={styles.recordButtonText}>Start Recording</Text>
                    </TouchableOpacity>
                    
                    <Text style={styles.subtext}>
                        Tap the microphone button to begin recording your first voice note.
                    </Text>
                </View>
            ) : (
                <>
                <SearchBar onSearch={handleSearch} />
                {<FlatList
                    data={filteredNotes}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <VoiceNoteItem
                        note={item}
                        onDelete={() => handleDelete(item.id)}
                        />
                    )}
                    contentContainerStyle={styles.listContainer} />
                }
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('Record')}
                >
                    <Ionicons name="mic" size={24} color={colors.background} />
                </TouchableOpacity>
                </>
            )}
    </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
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
        color: colors.text,
        marginBottom: theme.spacing.sm
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: theme.spacing.lg,
    },
    description: {
        fontSize: 16,
        color: colors.text,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        borderRadius: 8,
        paddingVertical: theme.spacing.md,
        marginVertical: theme.spacing.md,
    },
    recordButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.background,
        marginLeft: theme.spacing.sm,
    },
    subtext: {
        fontSize: 14,
        color: colors.textSecondary,
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
        color: colors.primary,
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
        backgroundColor: colors.primary,
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