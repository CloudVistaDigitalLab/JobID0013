import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import EmotionDialog from '../components/EmotionDialog';
import ToDoSelectDialog from '../components/ToDoSelectDialog';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Main: { userId: string };
  AddToDo: { userId: string; type: 'habit' | 'task' };
  TodayPlan: { userId: string };
};

type DashboardScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface DashboardScreenProps {
  route: DashboardScreenRouteProp;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ route }) => {
  const [userName, setUserName] = useState<string>('User');
  const [isModalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isCameraEmotion, setIsCameraEmotion] = useState<boolean>(false);
  const [isToDoDialogVisible, setToDoDialogVisible] = useState<boolean>(false);
  const [recommendedTasks, setRecommendedTasks] = useState<any[]>([]);
  const [recommendedHabits, setRecommendedHabits] = useState<any[]>([]);
  const userId = route.params?.userId;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Main'>>();
  const [recentActivities, setRecentActivities] = useState<string[]>([]);

  // 🧩 1️⃣ Fetch user details (on mount)
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        let id = userId;
        if (!id) {
          id = (await AsyncStorage.getItem('userId')) ?? "";
        }
        if (!id) return;

        const response = await fetch(`http://10.0.2.2:8000/users/${id}`);
        const data = await response.json();

        if (response.ok) {
          setUserName(data.name);

          const logs = data.emotion_logs || [];

          if (logs.length > 0) {
            const latestLog = logs.reduce((latest: any, current: any) =>
              new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
            );

            const logDate = new Date(latestLog.timestamp);
            const todayUTC = new Date();

            const isToday =
              logDate.getFullYear() === todayUTC.getFullYear() &&
              logDate.getMonth() === todayUTC.getMonth() &&
              logDate.getDate() === todayUTC.getDate();

            if (isToday) {
              setSelectedEmotion(latestLog.emotion);
              setIsCameraEmotion(latestLog.source === "AI");
              setModalVisible(false);
            } else {
              setModalVisible(true);
            }
          } else {
            setModalVisible(true);
          }
        } else {
          Alert.alert("Error", data.detail || "Failed to fetch user data.");
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Could not fetch user details.");
      }
    };

    fetchUserDetails();
  }, [userId]);

  // 🧩 2️⃣ Fetch recommendations (every time screen focuses)
  useFocusEffect(
    useCallback(() => {
      const fetchRecommendations = async () => {
        try {
          let id = userId;
          if (!id) {
            id = (await AsyncStorage.getItem('userId')) ?? "";
          }
          if (!id) return;

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
        }
      };

      fetchRecommendations();
    }, [userId])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchRecentActivities = async () => {
        try {
          let id = userId;
          if (!id) {
            id = (await AsyncStorage.getItem('userId')) ?? "";
          }
          if (!id) return;

          const response = await fetch(
            `http://10.0.2.2:8000/users/${id}/recent_activities`
          )
          if (response.ok) {
            const data = await response.json();
            setRecentActivities(data);
          } else {
            console.error("Failed to fetch recent activities");
          }
        } catch (error) {
          console.error(error);
        }
      };

      fetchRecentActivities();
    }, [userId])
  );

  // 🧩 3️⃣ Handlers
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

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("TodayPlan", { userId })}>
          <Text style={styles.cardTitle}>Today's Plan</Text>
          {recommendedTasks.length === 0 && recommendedHabits.length === 0 ? (
            <Text style={styles.cardText}>No recommended tasks or habits for today.</Text>
          ) : (
            <>
              <Text style={[styles.cardText, { fontWeight: "600" }]}>Tasks:</Text>
              {recommendedTasks.map((task, idx) => (
                <Text key={idx} style={styles.cardText}>- {task.title}</Text>
              ))}
              {recommendedTasks.length === 0 && (
                <Text style={styles.cardText}>No tasks available for today plan.</Text>
              )}

              <Text style={[styles.cardText, { fontWeight: "600", marginTop: 10 }]}>Habits:</Text>
              {recommendedHabits.map((habit, idx) => (
                <Text key={idx} style={styles.cardText}>- {habit.title}</Text>
              ))}
              {recommendedHabits.length === 0 && (
                <Text style={styles.cardText}>No habbits available for today plan.</Text>
              )}
            </>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Mood Tracker</Text>
          <Text style={styles.cardText}>
            Your current mood:
            {selectedEmotion 
              ? ` ${selectedEmotion}` 
              : isCameraEmotion 
                ? " Captured via Camera" 
                : " 😊"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          {recentActivities.length === 0 ? (
            <Text style={styles.cardText}>No recent activities.</Text>
          ) : (
            [...recentActivities].slice(-5).reverse().map((activity, idx) => (
              <Text key={idx} style={styles.cardText}>- {activity}</Text>
            ))
          )}
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setToDoDialogVisible(true)}
      >
        <Text style={styles.addButtonText}>＋</Text>
      </TouchableOpacity>

      <EmotionDialog visible={isModalVisible} onEmotionSelected={handleEmotionSelected} />
      <ToDoSelectDialog visible={isToDoDialogVisible} onSelect={handleToDoSelect} onClose={() => setToDoDialogVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3d7bac', marginBottom: 5 },
  welcomeText: { fontSize: 20, color: '#374151', fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  card: {
    backgroundColor: '#f6d581ff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
  cardText: { fontSize: 16, color: '#374151', marginBottom: 5 },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#3d7bac',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
});

export default DashboardScreen;
