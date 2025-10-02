import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  TodayPlan: { userId: string };
};

const TodayPlanScreen: React.FC = () => {
  const route = useRoute<any>(); // useRoute auto-injects route
  const [tasks, setTasks] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
      } else {
        Alert.alert("Error", data.detail || "Failed to update habit");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Today's Plan</Text>

        <Text style={styles.sectionTitle}>Tasks</Text>
        {tasks.length === 0 && <Text>No tasks for today</Text>}
        {tasks.map(task => (
          <View key={task.task_id} style={styles.item}>
            <Text>{task.title} - Status: {task.status}</Text>
            {task.status === "pending" && (
              <TouchableOpacity onPress={() => updateTaskStatus(task.task_id, "ongoing")}>
                <Text style={styles.button}>Start</Text>
              </TouchableOpacity>
            )}
            {task.status === "ongoing" && (
              <TouchableOpacity onPress={() => updateTaskStatus(task.task_id, "completed")}>
                <Text style={styles.button}>Complete</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <Text style={styles.sectionTitle}>Habits</Text>
        {habits.length === 0 && <Text>No habits for today</Text>}
        {habits.map(habit => (
          <View key={habit.habit_id} style={styles.item}>
            <Text>{habit.title} - Progress: {habit.progress}</Text>
            <TouchableOpacity onPress={() => completeHabit(habit.habit_id)}>
              <Text style={styles.button}>Mark Completed</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginTop: 15, marginBottom: 10 },
  item: { marginBottom: 10 },
  button: { color: 'blue', marginTop: 5 }
});

export default TodayPlanScreen;
