import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RouteProp, useNavigation } from '@react-navigation/native';

type RootStackParamList = {
  AddToDo: { type: 'habit' | 'task' }; // ✅ no need for userId param anymore
};

type AddToDoScreenRouteProp = RouteProp<RootStackParamList, 'AddToDo'>;

interface AddToDoScreenProps {
  route: AddToDoScreenRouteProp;
}

const AddToDoScreen: React.FC<AddToDoScreenProps> = ({ route }) => {
  const { type } = route.params;
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily'); // habit only
  const [dueDate, setDueDate] = useState(''); // task only

  const handleSubmit = async () => {
    try {
      // ✅ get userId from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }

      const body =
        type === 'habit'
          ? { habit_id: Date.now().toString(), title, description, frequency, progress: 0 }
          : { task_id: Date.now().toString(), title, description, due_date: dueDate, status: 'pending' };

      const endpoint = type === 'habit'
        ? `http://10.0.2.2:8000/users/${userId}/habits`
        : `http://10.0.2.2:8000/users/${userId}/tasks`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        Alert.alert(`${type === 'habit' ? 'Habit' : 'Task'} added successfully!`);
        navigation.goBack();
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to connect to server.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add {type === 'habit' ? 'Habit' : 'Task'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      {type === 'habit' && (
        <TextInput
          style={styles.input}
          placeholder="Frequency (daily/weekly/custom)"
          value={frequency}
          onChangeText={setFrequency}
        />
      )}

      {type === 'task' && (
        <TextInput
          style={styles.input}
          placeholder="Due Date (YYYY-MM-DD)"
          value={dueDate}
          onChangeText={setDueDate}
        />
      )}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddToDoScreen;
