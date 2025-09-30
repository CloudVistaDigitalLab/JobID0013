import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import EmotionDialog from '../components/EmotionDialog';
import ToDoSelectDialog from '../components/ToDoSelectDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Main: { userId: string };
  AddToDo: { userId: string; type: 'habit' | 'task' };
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
  const [isToDoDialogVisible, setToDoDialogVisible] = useState<boolean>(false);
  const [recommendedTasks, setRecommendedTasks] = useState<any[]>([]);
  const [recommendedHabits, setRecommendedHabits] = useState<any[]>([]);
  const userId = route.params?.userId;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Main'>>();

  useEffect(() => {
    const fetchUserAndRecommendations = async () => {
      try {
        let id = userId;
        if (!id) {
          id = (await AsyncStorage.getItem('userId')) ?? ""; // fallback
        }
        if (!id) return;

        // Fetch user
        const response = await fetch(`http://10.0.2.2:8000/users/${id}`);
        const data = await response.json();
        if (response.ok) {
          setUserName(data.name);
        } else {
          Alert.alert("Error", data.detail || "Failed to fetch user data.");
        }

        // Fetch recommendations
        const recRes = await fetch(`http://10.0.2.2:8000/users/${id}/recommendations`);
        const recData = await recRes.json();

        if (recRes.ok) {
          setRecommendedTasks(recData.recommended_tasks || []);
          setRecommendedHabits(recData.recommended_habits || []);
        } else {
          console.log("Recommendations error:", recData.detail);
        }

      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not fetch user details or recommendations.");
      }
    };

    fetchUserAndRecommendations();
  }, [userId]);

  const handleEmotionSelected = (emotion: string, isCamera: boolean) => {
    setSelectedEmotion(emotion);
    setIsCameraEmotion(isCamera);
    setModalVisible(false);
  };

  const handleToDoSelect = (type: 'habit' | 'task') => {
    setToDoDialogVisible(false);
    navigation.navigate("AddToDo", { userId, type });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
        <Text style={styles.subtitle}>Your progress at a glance</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Plan</Text>
          {recommendedTasks.length === 0 && recommendedHabits.length === 0 ? (
            <Text style={styles.cardText}>No recommended tasks or habits for today.</Text>
          ) : (
            <>
              <Text style={[styles.cardText, { fontWeight: "600" }]}>Tasks:</Text>
              {recommendedTasks.map((task, idx) => (
                <Text key={idx} style={styles.cardText}>- {task.title}</Text>
              ))}

              <Text style={[styles.cardText, { fontWeight: "600", marginTop: 10 }]}>Habits:</Text>
              {recommendedHabits.map((habit, idx) => (
                <Text key={idx} style={styles.cardText}>- {habit.title}</Text>
              ))}
            </>
          )}
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

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setToDoDialogVisible(true)}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>


      <EmotionDialog
        visible={isModalVisible}
        onEmotionSelected={handleEmotionSelected}
      />

      <ToDoSelectDialog
        visible={isToDoDialogVisible}
        onSelect={handleToDoSelect}
        onClose={() => setToDoDialogVisible(false)}
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
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;