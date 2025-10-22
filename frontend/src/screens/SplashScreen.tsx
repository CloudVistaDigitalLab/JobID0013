import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
// 1. Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage'; 

type RootStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    Main: undefined; // Added 'Main' for navigation after login check
};

// Updated the type to include all possible destinations from Splash
type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList>; 

interface SplashScreenProps {
    navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
    
    // 2. New function to determine the initial route
    const determineInitialRoute = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
            
            // 3. Logic to decide the next screen
            let initialRouteName: keyof RootStackParamList;

            if (userId) {
                // User is logged in, go to Main/Dashboard
                initialRouteName = 'Main';
            } else if (onboardingComplete) {
                // User completed onboarding but is not logged in, go to Login
                initialRouteName = 'Login';
            } else {
                // First time user, go to Onboarding
                initialRouteName = 'Onboarding';
            }

            // Replace the Splash screen with the determined route
            navigation.replace(initialRouteName);

        } catch (error) {
            console.error('Error fetching data from AsyncStorage:', error);
            // Fallback to Onboarding in case of error
            navigation.replace('Onboarding'); 
        }
    };

    useEffect(() => {
        // Run the logic after a short delay for the splash screen effect
        const timer = setTimeout(() => {
            determineInitialRoute();
        }, 2000); // Reduced to 2s for faster development/user experience

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/logo/logo.png')}
                style={styles.logo}
            />
            {/* <Text style={styles.title}>EvoMind</Text> */}
            <ActivityIndicator size="large" color="#4B5563" style={styles.spinner} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 20,
    },
    spinner: {
        marginTop: 50,
    },
});

export default SplashScreen;