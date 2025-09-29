import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import type { Swiper as SwiperRef } from 'react-native-swiper';
import { StackNavigationProp } from '@react-navigation/stack';
import LottieView from 'lottie-react-native';
// 1. Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import HelloAppleAnimation from '../assets/animation/Hello (apple).json';
import PlanAnimation from '../assets/animation/plan.json';
import MoodAnimation from '../assets/animation/mood.json'

const { width } = Dimensions.get('window');

type RootStackParamList = {
    Login: undefined;
    // Add other screen names here
};

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface OnboardingScreenProps {
    navigation: OnboardingScreenNavigationProp;
}

const onboardingData = [
    {
        key: '1',
        title: 'Welcome to EvoMind',
        description: 'Manage your academic habits with emotional intelligence.',
        animation: HelloAppleAnimation, // Use the Lottie animation
    },
    {
        key: '2',
        title: 'Track Your Mood',
        description: 'Monitor your emotional state to stay productive and consistent.',
        animation: MoodAnimation,
    },
    {
        key: '3',
        title: 'Adaptive Planning',
        description: 'The app adjusts your schedule based on how you feel.',
        animation: PlanAnimation,
    },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
    const swiperRef = React.useRef<SwiperRef>(null);

    const isLastSlide = (index: number) => index === onboardingData.length - 1;

    // State to track the current slide index
    const [currentIndex, setCurrentIndex] = React.useState(0);

    // 2. Updated function to handle the button press and set the flag
    const handleNextPress = async () => {
        if (isLastSlide(currentIndex)) {
            // Last slide: Set the flag and Navigate to Login
            try {
                // Set the flag to indicate onboarding is complete
                await AsyncStorage.setItem('onboardingComplete', 'true');
            } catch (error) {
                console.error('Error setting onboarding complete flag:', error);
            }
            navigation.replace('Login');
        } else {
            // Not last slide: Advance the Swiper to the next index
            swiperRef.current?.scrollBy(1, true); // The '1' is the number of pages to scroll, 'true' is for animation
        }
    };
    
    // 3. Function to handle Skip press (also sets the flag)
    const handleSkipPress = async () => {
         try {
            await AsyncStorage.setItem('onboardingComplete', 'true');
        } catch (error) {
            console.error('Error setting onboarding complete flag on skip:', error);
        }
        navigation.replace('Login');
    }

    return (
        <View style={styles.container}>
            <Swiper
                // Attach the ref to the Swiper component
                ref={swiperRef}
                style={styles.wrapper}
                loop={false}
                showsButtons={false}
                dotStyle={styles.dot}
                activeDotStyle={styles.activeDot}
                onIndexChanged={setCurrentIndex} // Update the current index
            >
                {onboardingData.map((item) => (
                    <View key={item.key} style={styles.slide}>
                        <View style={styles.mediaContainer}>
                            {item.animation ? (
                                <LottieView
                                    source={item.animation}
                                    autoPlay
                                    loop
                                    style={styles.media}
                                />
                            ) : (
                                <View style={styles.media} /> 
                            )}
                        </View>
                        <Text style={styles.onboardingTitle}>{item.title}</Text>
                        <Text style={styles.onboardingDescription}>{item.description}</Text>
                    </View>
                ))}
            </Swiper>

            <View style={styles.footer}>
                {/* Skip button is only visible on first two slides (when not last) */}
                {!isLastSlide(currentIndex) && (
                    <TouchableOpacity style={styles.skipButton} onPress={handleSkipPress}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>
                )}

                {/* Spacer to push the next/finish button to the right when Skip is present */}
                <View style={{ flex: 1 }} />

                {/* Update the onPress handler to use the new logic */}
                <TouchableOpacity style={styles.nextButton} onPress={handleNextPress}>
                    <Text style={styles.nextText}>
                        {isLastSlide(currentIndex) ? 'Get Started' : 'Next'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6', // Light Gray Background
    },
    wrapper: {},
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30, // Increase padding for better look
        paddingTop: 50, // Push content down slightly
    },

    // Media Container for consistent look and shadow if needed
    mediaContainer: {
        width: width * 0.85,
        height: width * 0.85,
        borderRadius: 25, // Slightly more rounded corners
        overflow: 'hidden', // Ensures media stays within bounds
        backgroundColor: '#FFFFFF', // White background for the media area
        elevation: 5, // Subtle shadow for depth (Android)
        shadowColor: '#000', // Subtle shadow (iOS)
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    media: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },

    onboardingTitle: {
        fontSize: 28, // Slightly larger title
        fontWeight: '900', // Bolder title
        color: '#1F2937', // Dark Gray Title
        marginTop: 40, // Increased margin
        textAlign: 'center',
    },
    onboardingDescription: {
        fontSize: 17,
        color: '#6B7280', // Medium Gray Description
        marginTop: 15,
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 24, // Better readability
    },

    // --- Footer and Button Styles ---
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Changed to space-between for better footer alignment
        alignItems: 'center', // Align items vertically
        paddingHorizontal: 20,
        paddingTop: 20, // Add padding top
        // Enforced margin for the whole footer
        marginBottom: 20,
    },
    skipButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    skipText: {
        fontSize: 16,
        color: '#6B7280',
        fontWeight: '500', // Slightly bolder skip text
    },
    nextButton: {
        backgroundColor: '#4B5563', // Dark Gray Button
        paddingVertical: 14, // Increase padding for a more substantial button
        paddingHorizontal: 30,
        borderRadius: 50, // More rounded button
        // Enforced bottom margin for the next/finish button
        marginBottom: 40,
        minWidth: 120, // Minimum width for 'Next'/'Get Started'
        alignItems: 'center', // Center text
    },
    nextText: {
        fontSize: 16,
        color: '#F3F4F6', // Light Gray Text
        fontWeight: 'bold',
    },

    // --- Swiper Dot Styles ---
    dot: {
        backgroundColor: 'rgba(75,85,99,0.3)', // Lighter version of the main color
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
        marginBottom: 60, // Push dots up to avoid the bottom margin area
    },
    activeDot: {
        backgroundColor: '#4B5563', // Main button color
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 4,
        marginBottom: 60, // Push dots up
    },
});

export default OnboardingScreen;