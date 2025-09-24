import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Onboarding: undefined;
  // Add other screen names here as they are defined in the navigator
};

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        //source={require('../../assets/logo.png')} // Replace with your logo image path
        style={styles.logo}
      />
      <Text style={styles.title}>EvoMind</Text>
      <ActivityIndicator size="large" color="#4B5563" style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
