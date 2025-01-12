import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';
import { useSettings } from '../context/SettingContext';

export const SearchBar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showClear, setShowClear] = useState(false);
    const { settings } = useSettings();
    const currentTheme = settings.darkMode ? colors.dark : colors.light;

    useEffect(() => {
        setShowClear(searchQuery.length > 0);
        onSearch(searchQuery);
    }, [searchQuery]);

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <View style={[styles.searchContainer, {
            backgroundColor: currentTheme.background,
            borderBottomColor: currentTheme.border
        }]}>
            <View style={[styles.searchWrapper, {
                backgroundColor: currentTheme.border
            }]}>
                <Ionicons 
                    name="search-outline" 
                    size={20} 
                    color={currentTheme.textSecondary} 
                    style={styles.searchIcon}
                />
                <TextInput
                    style={[styles.searchInput, {
                        color: currentTheme.text
                    }]}
                    placeholder="Search voice notes..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={currentTheme.textSecondary}
                />
                {showClear && (
                    <TouchableOpacity onPress={clearSearch}>
                        <Ionicons 
                            name="close-circle" 
                            size={20} 
                            color={currentTheme.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        padding: theme.spacing.sm,
        borderBottomWidth: 1,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: theme.spacing.sm,
    },
    searchIcon: {
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
});