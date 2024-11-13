import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

const HomeScreen = ({ navigation }) => {
    return (
        <View style={styles.container}>
        <View style={styles.header}>
            
            <Text style={styles.title}>Voice Note</Text>
            <Text style={styles.subtitle}>Your personal audio journal</Text>
        </View>

        <View style={styles.content}>
            <Text style={styles.description}>
            Voice Note is a simple and easy-to-use voice recording app. 
            Record your thoughts, ideas, or reminders on the go, and
            access them whenever you need them.
            </Text>

            <TouchableOpacity
            style={styles.recordButton}
            onPress={() => navigation.navigate('Record')}
            >
            <Ionicons name="mic" size={24} color="white" />
            <Text style={styles.recordButtonText}>Start Recording</Text>
            </TouchableOpacity>

            <Text style={styles.subtext}>
            Tap the microphone button to begin recording your first voice note.
            </Text>

        
        </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        backgroundColor: colors.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.background,
    },
    subtitle: {
        fontSize: 16,
        color: colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.lg,
    },
    description: {
        fontSize: 16,
        color: colors.text,
        marginBottom: theme.spacing.md,
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
});

export default HomeScreen;