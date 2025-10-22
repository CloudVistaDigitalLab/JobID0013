import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Modal, Pressable } from 'react-native';

type RootStackParamList = {
  TodayPlan: { userId: string };
};

const TodayPlanScreen: React.FC = () => {
  const route = useRoute<any>(); // useRoute auto-injects route
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const relaxingMessages = [
    "Take a deep breath... You did great! 🌿",
    "Stretch your arms and rest for a minute 🧘",
    "Well done! Grab a glass of water 💧",
    "Close your eyes, inhale... exhale... 😌",
    "Nice work! Listen to a calm tune before your next task 🎵"
  ];

  const taskStartedMessages = [
    "Awesome! Keep the momentum going! 🚀",
    "Great start! You're on your way! 🌟",
    "Way to go! Keep pushing forward! 💪",
    "Fantastic! You're making progress! 🎯",
    "Excellent! Stay focused and keep it up! 🔥"
  ];

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const [showStartedPopup, setShowStartedPopup] = useState(false);
  const [startedPopupMessage, setStartedPopupMessage] = useState('');

  const fetchTodayPlan = async (id: string) => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/users/${id}/recommendations`);
      const data = await res.json();
      if (res.ok) {
        setTasks(data.recommended_tasks || []);
        setHabits(data.recommended_habits || []);
      } else {
        console.log("Error fetching today plan:", data.detail);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUserIdAndPlan = async () => {
      const id = await AsyncStorage.getItem('userId');
      if (!id) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }
      setUserId(id); // keep for later usage
      fetchTodayPlan(id); // pass id directly here
    };
    fetchUserIdAndPlan();
  }, []);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/users/${userId}/daily_recommendations/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(prev => prev.map(t => t.task_id === taskId ? { ...t, status } : t));
        if (status === "completed") {
          const randomMsg = relaxingMessages[Math.floor(Math.random() * relaxingMessages.length)];
          setPopupMessage(randomMsg);
          setShowPopup(true);
        }
        if (status === "ongoing") {
          const randomMsg = taskStartedMessages[Math.floor(Math.random() * taskStartedMessages.length)];
          setStartedPopupMessage(randomMsg);
          setShowStartedPopup(true);
        }
      } else {
        Alert.alert("Error", data.detail || "Failed to update task");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const completeHabit = async (habitId: string) => {
    try {
      const res = await fetch(`http://10.0.2.2:8000/users/${userId}/daily_recommendations/habits/${habitId}/complete`, { method: "PATCH" });
      const data = await res.json();
      if (res.ok) {
        setHabits(prev => prev.map(h => h.habit_id === habitId ? { ...h, progress: data.progress } : h));
        const randomMsg = relaxingMessages[Math.floor(Math.random() * relaxingMessages.length)];
        setPopupMessage(randomMsg);
        setShowPopup(true);
      } else {
        Alert.alert("Error", data.detail || "Failed to update habit");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const testPopup = () => {
    const randomMsg = relaxingMessages[Math.floor(Math.random() * relaxingMessages.length)];
    setPopupMessage(randomMsg);
    setShowPopup(true);
  }

  const testStartedPopup = () => {
    const randomMsg = taskStartedMessages[Math.floor(Math.random() * taskStartedMessages.length)];
    setStartedPopupMessage(randomMsg);
    setShowStartedPopup(true);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* <Text style={styles.title}>Today's Plan</Text>  */}

        <TouchableOpacity onPress={() => testPopup()}>
          <Text style={styles.button}>Test</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => testStartedPopup()}>
          <Text style={styles.button}>Test Started</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Tasks</Text>
        {tasks.length === 0 && <Text style={[styles.card, {backgroundColor: "#fd5c5cff", color: "white"}]}>No tasks for today</Text>}
        {tasks.map(task => (
          <View key={task.task_id} style={styles.card}>
            <Text style={styles.cardTitle}>{task.title}</Text>
            <Text>{task.description}</Text>
            <Text style={styles.cardBadge}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</Text>
            {task.status === "pending" && (
              <TouchableOpacity onPress={() => updateTaskStatus(task.task_id, "ongoing")}>
                <Text style={styles.cardButton}>I Started the Task</Text>
              </TouchableOpacity>
            )}
            {task.status === "ongoing" && (
              <TouchableOpacity onPress={() => updateTaskStatus(task.task_id, "completed")}>
                <Text style={styles.cardButton}>I Completed the Task</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Habits</Text>
        {habits.length === 0 && <Text style={[styles.card, {backgroundColor: "#fd5c5cff", color: "white"}]}>No habits for today</Text>}
        {habits.map(habit => (
          <View key={habit.habit_id} style={styles.card}>
            <Text  style={styles.cardTitle}>{habit.title}</Text>
            <Text>{habit.description}</Text>
            <Text style={styles.cardBadge}>Progress: {habit.progress}</Text>
            <TouchableOpacity onPress={() => completeHabit(habit.habit_id)}>
              <Text style={styles.cardButton}>Mark Completed</Text>
            </TouchableOpacity>
          </View>
        ))}
        <Modal visible={showPopup} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Relax & Recharge 🌊</Text>
              <Text style={styles.modalMessage}>{popupMessage}</Text>

              <Pressable style={styles.modalButton} onPress={() => setShowPopup(false)}>
                <Text style={styles.modalButtonText}>Continue</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal visible={showStartedPopup} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Great Start! 🚀</Text>
              <Text style={styles.modalMessage}>{startedPopupMessage}</Text>
              <Pressable style={styles.modalButton} onPress={() => setShowStartedPopup(false)}>
                <Text style={styles.modalButtonText}>Keep Going</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3d7bac', marginBottom: 5 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 15, marginBottom: 10 },
  item: { marginBottom: 10 },
  button: { color: 'blue', marginTop: 5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#e6f1f8',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3d7bac',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#2a547a',
    marginBottom: 25,
  },
  modalButton: {
    backgroundColor: '#3d7bac',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f6d581ff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 },
  cardText: { fontSize: 16, color: '#374151', marginBottom: 5 },
  cardBadge: {
    marginTop: 10,
    backgroundColor: '#3d7bac',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    color: '#fff',
    fontWeight: '600',
    position: 'absolute',
    top: -25,
    right: -8,
  },
  cardButton: {
    marginTop: 15,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default TodayPlanScreen;
