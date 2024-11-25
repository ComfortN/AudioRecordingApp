import React, { useEffect } from 'react';
import { View, Image, Animated, Dimensions, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const SplashScreen = ({ onFinish }) => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;
    const scaleAnim = React.useRef(new Animated.Value(0.3)).current;
    
    // Get screen dimensions
    const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
    
    // Calculate logo size (50% of the smaller screen dimension)
    const logoSize = Math.min(screenWidth, screenHeight) * 0.5;

    useEffect(() => {
        // Animate logo fade in and scale up
        Animated.parallel([
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 10,
            friction: 2,
            useNativeDriver: true,
        }),
        ]).start();

        // Trigger onFinish after delay
        const timer = setTimeout(() => {
        onFinish();
        }, 2000);

        return () => clearTimeout(timer);
    }, [fadeAnim, scaleAnim]);

    return (
        <View style={styles.container}>
        <Animated.View
            style={[
            styles.logoContainer,
            {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
            },
            ]}
        >
            <Image
            source={require('../../assets/reflectory.png')}
            style={[
                styles.logo,
                {
                width: logoSize,
                height: logoSize,
                },
            ]}
            resizeMode="contain"
            />
        </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        // Base styles for the logo
        // Actual dimensions are set dynamically
    },
});

export default SplashScreen;