import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { theme } from '../constants/theme';

export const SearchBar = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showClear, setShowClear] = useState(false);

    useEffect(() => {
        setShowClear(searchQuery.length > 0);
        onSearch(searchQuery);
    }, [searchQuery]);

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <View style={styles.searchContainer}>
            <View style={styles.searchWrapper}>
                <Ionicons 
                    name="search-outline" 
                    size={20} 
                    color={colors.textSecondary} 
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search voice notes..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor={colors.textSecondary}
                />
                {showClear && (
                    <TouchableOpacity onPress={clearSearch}>
                        <Ionicons 
                            name="close-circle" 
                            size={20} 
                            color={colors.textSecondary}
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
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.border,
        borderRadius: 8,
        paddingHorizontal: theme.spacing.sm,
    },
    searchIcon: {
        marginRight: theme.spacing.sm,
    },
    searchInput: {
        flex: 1,
        height: 40,
        color: colors.text,
        fontSize: 16,
    },
});