import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import EmotionDialog from '../components/EmotionDialog';

type RootStackParamList = {
  Main: { userId: string };
};

type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface DashboardScreenProps {
  route: DashboardScreenRouteProp;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ route }) => {
  const [userName, setUserName] = useState<string>('User');
  const [isModalVisible, setModalVisible] = useState<boolean>(true);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isCameraEmotion, setIsCameraEmotion] = useState<boolean>(false);
  const userId = route.params?.userId;

  useEffect(() => {
    if (!userId) return;
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://10.0.2.2:8000/users/${userId}`);
        const data = await response.json();
        
        if (response.ok) {
          setUserName(data.name);
        } else {
          Alert.alert("Error", data.detail || "Failed to fetch user data.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not fetch user details from server.");
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleEmotionSelected = (emotion: string, isCamera: boolean) => {
    setSelectedEmotion(emotion);
    setIsCameraEmotion(isCamera);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <Text style={styles.subtitle}>Your progress at a glance</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Plan</Text>
          <Text style={styles.cardText}>You have 3 tasks scheduled for today.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Tracker</Text>
          <Text style={styles.cardText}>
            Your current mood: {selectedEmotion || (isCameraEmotion ? "Captured via Camera" : "Happy 😊")}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <Text style={styles.cardText}>- Completed "Math Homework"</Text>
          <Text style={styles.cardText}>- Started "Reading Chapter 5"</Text>
        </View>
      </ScrollView>

      <EmotionDialog
        visible={isModalVisible}
        onEmotionSelected={handleEmotionSelected}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 5,
  },
});

export default DashboardScreen;