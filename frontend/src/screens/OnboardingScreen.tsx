import React from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native';
import Swiper from 'react-native-swiper';
import { StackNavigationProp } from '@react-navigation/stack';

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
    image: 'https://placehold.co/300x300/E5E7EB/4B5563?text=Slide+1', // Replace with your image
  },
  {
    key: '2',
    title: 'Track Your Mood',
    description: 'Monitor your emotional state to stay productive and consistent.',
    image: 'https://placehold.co/300x300/D1D5DB/4B5563?text=Slide+2', // Replace with your image
  },
  {
    key: '3',
    title: 'Adaptive Planning',
    description: 'The app adjusts your schedule based on how you feel.',
    image: 'https://placehold.co/300x300/9CA3AF/4B5563?text=Slide+3', // Replace with your image
  },
];

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Swiper
        style={styles.wrapper}
        loop={false}
        showsButtons={false}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
      >
        {onboardingData.map((item) => (
          <View key={item.key} style={styles.slide}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
            />
            <Text style={styles.onboardingTitle}>{item.title}</Text>
            <Text style={styles.onboardingDescription}>{item.description}</Text>
          </View>
        ))}
      </Swiper>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={() => navigation.replace('Login')}>
          <Text style={styles.nextText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: width * 0.8,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 30,
    textAlign: 'center',
  },
  onboardingDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 10,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 16,
    color: '#6B7280',
  },
  nextButton: {
    backgroundColor: '#4B5563',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  nextText: {
    fontSize: 16,
    color: '#F3F4F6',
    fontWeight: 'bold',
  },
  dot: {
    backgroundColor: 'rgba(0,0,0,.2)',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  activeDot: {
    backgroundColor: '#4B5563',
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});

export default OnboardingScreen;
