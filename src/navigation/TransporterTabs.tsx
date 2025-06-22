import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TransporterHomeScreen from '../screens/Transporter/TransporterHomeScreen';
import ManageFleetScreen from '../screens/Transporter/ManageFleetScreen';
import MyLoadsScreen from '../screens/Common/MyLoadsScreenD';
import BookedLorriesScreen from '../screens/Common/BookedLorriesScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';

const Tab = createBottomTabNavigator();

const TransporterTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: { height: 60, paddingBottom: 6 },
      }}
    >
      <Tab.Screen
        name="TransporterHome"
        component={TransporterHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="MyLoads"
        component={MyLoadsScreen}
        options={{
          tabBarLabel: 'My Loads',
          tabBarIcon: ({ color, size }) => (
            <Icon name="truck-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="BookedLorries"
        component={BookedLorriesScreen}
        options={{
          tabBarLabel: 'Booked Lorries',
          tabBarIcon: ({ color, size }) => (
            <Icon name="truck-check-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ManageFleet"
        component={ManageFleetScreen}
        options={{
          tabBarLabel: 'Fleet',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-cog-outline" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ type: 'transporter' }}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TransporterTabs;
