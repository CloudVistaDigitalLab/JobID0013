import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useFocusEffect, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useCallback, useEffect, useState } from "react";
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import Ionicons from "react-native-vector-icons/Ionicons";

type RootStackParamList = {
  Main: { userId: string };
  AddToDo: { userId: string; type: 'habit' | 'task' };
  TodayPlan: { userId: string };
  Login: undefined;
};

type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Main'>;

interface ProfileScreenProps {
  route: ProfileScreenRouteProp;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Main'>>();
  const userId = route.params?.userId;
  const [user, setUser] = useState<any>(null);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [completedHabits, setCompletedHabits] = useState<number>(0);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);

  const [isEditProfileVisible, setEditProfileVisible] = useState(false);
  const [isChangePasswordVisible, setChangePasswordVisible] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        let id = userId;
        if (!id) {
          id = (await AsyncStorage.getItem('userId')) ?? "";
        }
        if (!id) return;
        const response = await fetch(`http://10.0.2.2:8000/users/${id}`);
        const data = await response.json();
        if (response.ok) {
            setUser(data);
            setName(data.name);
            setEmail(data.email);
            const tasks = data.tasks?.filter((task: any) => task.status === 'completed');
            setCompletedTasks(tasks ? tasks.length : 0);
            
            // const habits = data.todos?.filter((todo: any) => todo.type === 'habit' && todo.completed);
            // setCompletedHabits(habits ? habits.length : 0);
            const logs = data.emotion_logs || [];
            if (logs.length > 0) {
                const latestLog = logs[logs.length - 1];
                setCurrentEmotion(latestLog.emotion);
            }
        }
      };
      fetchUser();
    }, [userId])
  );

    const handleUpdateProfile = async () => {
        let id = userId;
        if (!id) {
          id = (await AsyncStorage.getItem('userId')) ?? "";
        }
        if (!id) return;
        if (!name || !email) {
            Alert.alert("Error", "Name and Email cannot be empty.");
            return;
        }

        try {
            const response = await fetch(`http://10.0.2.2:8000/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
            Toast.show({ type: "success", text1: "Profile updated successfully" });
            setEditProfileVisible(false);
            const updated = await response.json();
            setUser(updated);
            } else {
            Toast.show({ type: "error", text1: "Failed to update profile" });
            }
        } catch (error) {
            console.error("Update Error:", error);
        }
    };

    const handleChangePassword = async () => {
        let id = userId;
        if (!id) {
          id = (await AsyncStorage.getItem('userId')) ?? "";
        }
        if (!id) return;
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert("Error", "All fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "New passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`http://10.0.2.2:8000/users/${id}/password?old_password=${oldPassword}&new_password=${newPassword}`, {
            method: "PATCH",
            });

            if (response.ok) {
            Toast.show({ type: "success", text1: "Password changed successfully" });
            setChangePasswordVisible(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            } else {
            const data = await response.json();
            Toast.show({ type: "error", text1: data.detail || "Failed to change password" });
            }
        } catch (error) {
            console.error("Password Change Error:", error);
        }
    };

  const handleLogout = async () => {
      try {
          // Remove specific item
          await AsyncStorage.removeItem('userId');

          // OR if you want to clear all stored data, use:
          // await AsyncStorage.clear();

          Toast.show({
              type: 'success',
              text1: 'Logged Out',
              text2: 'You have been logged out successfully.',
              visibilityTime: 2000,
              autoHide: true,
          });

          navigation.replace('Login');
      } catch (error) {
          console.error("Logout error:", error);
          Alert.alert("Error", "Could not log out. Please try again.");
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle-outline" size={100} color="#4B5563" />
          <View>
            <Text style={styles.profileName}>
                {user ? `${user.name}` : 'Loading...'}
            </Text>
            <Text style={styles.profileEmail}>
                {user ? `${user.email}` : 'Loading...'}
            </Text>
          </View>
          
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <Text style={styles.cardText}>Name: {user ? `${user.name}` : 'Loading...'}</Text>
          <Text style={styles.cardText}>Email: {user ? `${user.email}` : 'Loading...'}</Text>
          <Text style={styles.cardText}>Current Emotion: {currentEmotion? currentEmotion:""}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setEditProfileVisible(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setChangePasswordVisible(true)}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Usage Stats</Text>
          <Text style={styles.cardText}>
            Completed Tasks: {completedTasks}
          </Text>
          {/* <Text style={styles.cardText}>
            Completed Habits: {completedHabits}
          </Text> */}
        </View>

        <TouchableOpacity style={[styles.button, { marginTop: 0 }]} onPress={() => navigation.navigate('TodayPlan', { userId })}>
            <Text style={styles.buttonText}>View Today's Plan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
        
        {/* Edit Profile Modal */}
        <Modal visible={isEditProfileVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
                placeholder="Name"
                value={name}
                onChangeText={setName}
                style={styles.input}
            />
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditProfileVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>

        {/* Change Password Modal */}
        <Modal visible={isChangePasswordVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
                placeholder="Old Password"
                value={oldPassword}
                onChangeText={setOldPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={styles.input}
            />
            <TextInput
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
            />
            <View style={styles.modalActions}>
                <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setChangePasswordVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    gap: 15,
    alignContent: 'center',
    
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
  },
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
  button: {
    backgroundColor: '#3d7bac',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#F3F4F6',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsHeader: {
    marginBottom: 20,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingText: {
    fontSize: 16,
    color: '#374151',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#3d7bac', marginBottom: 5 },
  welcomeText: { fontSize: 20, color: '#374151', fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 20 },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#3d7bac',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#3d7bac',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 5,
  },
});

export default ProfileScreen; 