import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox } from 'react-native';

import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AddToDoScreen from './src/screens/AddToDoScreen';
import TodayPlanScreen from './src/screens/TodayPlanScreen';

// Ignore specific warning messages from external libraries
LogBox.ignoreLogs([
    'Your project is accessing the following APIs from a deprecated global '
]);

type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  AddToDo: { userId: string; type: 'habit' | 'task' };
  TodayPlan: undefined; // Add this line to define TodayPlan route params
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
    useEffect(() => {
        console.log("App component mounted and 'react-native-gesture-handler' is imported.");
    }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
        headerTitleStyle: {
          fontSize: 28,
          fontWeight: 'bold',
          color: '#3d7bac',
        },
        headerStyle: {
          backgroundColor: '#f9f9f9',
        },
      }}
    >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Main" component={BottomTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="AddToDo" component={AddToDoScreen} options={{ title: 'Add To-Do' }} />
        <Stack.Screen name="TodayPlan" component={TodayPlanScreen} options={{title: 'Today Plan'}}/>
      </Stack.Navigator>
    </NavigationContainer>
  );

};

export default App;