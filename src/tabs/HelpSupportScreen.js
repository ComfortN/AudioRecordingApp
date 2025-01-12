import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { colors } from '../constants/colors';
import { useSettings } from '../context/SettingContext';

const HelpSupportScreen = () => {
    const { settings } = useSettings();
    const currentTheme = settings.darkMode ? colors.dark : colors.light;

    return (
        <ScrollView style={[styles.container, { backgroundColor: currentTheme.background }]}>
            <View style={styles.section}>
                
                {/* FAQ Section */}
                <Text style={[styles.subtitle, { color: currentTheme.textSecondary}]}>FAQs</Text>
                <TouchableOpacity onPress={() => alert('How do I reset my password?')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>How do I reset my password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => alert('How to change profile picture?')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>How to change profile picture?</Text>
                </TouchableOpacity>

                {/* Troubleshooting Tips Section */}
                <Text style={[styles.subtitle, { color: currentTheme.textSecondary}]}>Troubleshooting</Text>
                <TouchableOpacity onPress={() => alert('App is not loading')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>App is not loading</Text>
                </TouchableOpacity>

                {/* Contact Support Section */}
                <Text style={[styles.subtitle, { color: currentTheme.textSecondary}]}>Contact Support</Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:support@reflectory.com')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>Email Support</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => alert('Call us at 011 234 5678')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>Phone Support</Text>
                </TouchableOpacity>

                {/* User Feedback Section */}
                <Text style={[styles.subtitle, { color: currentTheme.textSecondary}]}>Give Feedback</Text>
                <TouchableOpacity onPress={() => alert('Feedback form')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>Send Feedback</Text>
                </TouchableOpacity>

                {/* Legal Information Section */}
                <Text style={[styles.subtitle, { color: currentTheme.textSecondary}]}>Legal</Text>
                <TouchableOpacity onPress={() => Linking.openURL('https://yourapp.com/terms')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>Terms & Conditions</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://yourapp.com/privacy')}>
                    <Text style={[styles.item, { color: currentTheme.text}]}>Privacy Policy</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        padding: theme.spacing.lg,
    },
    
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginTop: theme.spacing.lg,
    },
    item: {
        fontSize: 16,
        color: colors.text,
        marginVertical: theme.spacing.sm,
    },
});

export default HelpSupportScreen;
