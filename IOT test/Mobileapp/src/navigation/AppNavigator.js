import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import OfficerScreen from '../screens/OfficerScreen';
import HikerScreen from '../screens/HikerScreen';
import { AuthContext } from '../../App';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, role } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user || !role ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : role === 'OFFICER' ? (
          <Stack.Screen name="OfficerHome" component={OfficerScreen} />
        ) : (
          <Stack.Screen name="HikerHome" component={HikerScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
