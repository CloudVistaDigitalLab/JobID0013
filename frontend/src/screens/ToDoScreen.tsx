import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Modal, TextInput } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

const API_URL = "http://10.0.2.2:8000/users"; // change if needed

// -------------------- TASKS TAB --------------------
const TasksTab: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Fields
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchTasks = async () => {
        const id = await AsyncStorage.getItem("userId");
        if (!id) return;
        setUserId(id);

        try {
          const res = await fetch(`${API_URL}/${id}/tasks`);
          const data = await res.json();
          setTasks(data);
        } catch (err) {
          console.error("Failed to fetch tasks:", err);
        }
      };

      fetchTasks();
    }, [])
  );

  const deleteTask = (taskId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this task?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await fetch(`${API_URL}/${userId}/tasks/${taskId}`, { method: "DELETE" });
          setTasks((prev) => prev.filter((t) => t.task_id !== taskId));
        },
      },
    ]);
  };

  const openEdit = (task: any) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditDueDate(task.due_date || "");
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!selectedTask) return;
    const updated = { ...selectedTask, title: editTitle, description: editDesc, due_date: editDueDate };

    await fetch(`${API_URL}/${userId}/tasks/${selectedTask.task_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setTasks((prev) =>
      prev.map((t) => (t.task_id === selectedTask.task_id ? updated : t))
    );
    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {tasks.length === 0 && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#6B7280", fontSize: 16 }}>No tasks available. Add some tasks!</Text>
        </View>
      )}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.task_id}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subText}>{item.description}</Text>
              <Text style={styles.subText}>Due: {item.due_date}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={24} color="#4B5563" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteTask(item.task_id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput style={styles.input} placeholder="Title" value={editTitle} onChangeText={setEditTitle} />
            <TextInput style={styles.input} placeholder="Description" value={editDesc} onChangeText={setEditDesc} />
            <TextInput style={styles.input} placeholder="Due Date (YYYY-MM-DD)" value={editDueDate} onChangeText={setEditDueDate} />
            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// -------------------- HABITS TAB --------------------
const HabitsTab: React.FC = () => {
  const [habits, setHabits] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<any>(null);

  // Fields
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFreq, setEditFreq] = useState("");

  useFocusEffect(
    useCallback(() => {
      const fetchHabits = async () => {
        const id = await AsyncStorage.getItem("userId");
        if (!id) return;
        setUserId(id);

        try {
          const res = await fetch(`${API_URL}/${id}/habits`);
          const data = await res.json();
          setHabits(data);
        } catch (err) {
          console.error("Failed to fetch habits:", err);
        }
      };

      fetchHabits();
    }, [])
  );

  const deleteHabit = (habitId: string) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this habit?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await fetch(`${API_URL}/${userId}/habits/${habitId}`, { method: "DELETE" });
          setHabits((prev) => prev.filter((h) => h.habit_id !== habitId));
        },
      },
    ]);
  };

  const openEdit = (habit: any) => {
    setSelectedHabit(habit);
    setEditTitle(habit.title);
    setEditDesc(habit.description || "");
    setEditFreq(habit.frequency || "");
    setEditModalVisible(true);
  };

  const saveEdit = async () => {
    if (!selectedHabit) return;
    const updated = { ...selectedHabit, title: editTitle, description: editDesc, frequency: editFreq };

    await fetch(`${API_URL}/${userId}/habits/${selectedHabit.habit_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    setHabits((prev) =>
      prev.map((h) => (h.habit_id === selectedHabit.habit_id ? updated : h))
    );
    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {habits.length === 0 && (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#6B7280", fontSize: 16 }}>No habits available. Add some habits!</Text>
        </View>
      )}
      <FlatList
        data={habits}
        keyExtractor={(item) => item.habit_id}
        renderItem={({ item }: { item: any }) => (
          <View style={styles.item}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subText}>{item.description}</Text>
              <Text style={styles.subText}>Frequency: {item.frequency}</Text>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <Ionicons name="create-outline" size={24} color="#4B5563" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteHabit(item.habit_id)}>
                <Ionicons name="trash-outline" size={24} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Habit</Text>
            <TextInput style={styles.input} placeholder="Title" value={editTitle} onChangeText={setEditTitle} />
            <TextInput style={styles.input} placeholder="Description" value={editDesc} onChangeText={setEditDesc} />
            <TextInput style={styles.input} placeholder="Frequency" value={editFreq} onChangeText={setEditFreq} />
            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// -------------------- MAIN TODO SCREEN --------------------
const ToDoScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.screenTitle}>Listed ToDos</Text>
      {/* <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
      <Text style={styles.subtitle}>Your progress at a glance {test}</Text> */}
      <Tab.Navigator>
        <Tab.Screen name="Tasks" component={TasksTab} />
        <Tab.Screen name="Habits" component={HabitsTab} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: "#ffffff" },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f6d581ff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "500", color: "#1F2937" },
  subText: { fontSize: 14, color: "#6B7280", width: 250 },
  actions: { flexDirection: "row", gap: 15 },
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3d7bac',
    marginBottom: 5,
    padding:20
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    width: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#111827" },
  input: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  saveBtn: { backgroundColor: "#4B5563", padding: 12, borderRadius: 8, marginBottom: 10 },
  saveText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  cancelBtn: { backgroundColor: "gray", padding: 12, borderRadius: 8 },
  cancelText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});

export default ToDoScreen;
