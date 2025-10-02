import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import DashboardScreen from '../screens/DashboardScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import ToDoScreen from '../screens/ToDoScreen';
// import ProfileScreen from '../screens/ProfileScreen';
// import SettingsScreen from '../screens/SettingsScreen';

type RootStackParamList = {
  Login: undefined;
};

const Tab = createBottomTabNavigator();

const BottomTabNavigator: React.FC<any> = ({ route }) => {
  const { userId } = route.params || {}; 
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4B5563',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;
          if (route.name === 'Dashboard') {
            iconName = 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          } else {
            iconName = 'help-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={(props: any) => <DashboardScreen {...props} />}
        initialParams={{ userId }}
      />
      <Tab.Screen name="ToDos" component={ToDoScreen} initialParams={{ userId }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Dummy Profile and Settings screens
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Login'>>();

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
        <View style={styles.profileHeader}>
          <Ionicons name="person-circle-outline" size={100} color="#4B5563" />
          <Text style={styles.profileName}>Student User</Text>
          <Text style={styles.profileEmail}>student.user@example.com</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <Text style={styles.cardText}>Username: studentuser</Text>
          <Text style={styles.cardText}>Joined: January 2024</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Usage Stats</Text>
          <Text style={styles.cardText}>Habits Tracked: 50</Text>
          <Text style={styles.cardText}>Emotions Logged: 120</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const SettingsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.settingsHeader}>
          <Text style={styles.settingsTitle}>Settings</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Push Notifications</Text>
            <Ionicons name="toggle-outline" size={30} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Email Alerts</Text>
            <Ionicons name="toggle-outline" size={30} color="#4B5563" />
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward-outline" size={30} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Terms of Service</Text>
            <Ionicons name="chevron-forward-outline" size={30} color="#4B5563" />
          </TouchableOpacity>
        </View>
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
    marginBottom: 30,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
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
  button: {
    backgroundColor: '#4B5563',
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
});

export default BottomTabNavigator;
