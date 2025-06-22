import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DriverHomeScreen from '../screens/Driver/DriverHomeScreen';
import MyLoadsScreen from '../screens/Common/MyLoadsScreenD';
import BookedLorriesScreen from '../screens/Common/BookedLorriesScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';


const Tab = createBottomTabNavigator();

const DriverTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#009FFD',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: { paddingBottom: 4, height: 58 },
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'DriverHome':
              iconName = 'home-outline';
              break;
            case 'MyLoads':
              iconName = 'truck-outline';
              break;
            case 'BookedLorries':
              iconName = 'truck-check-outline';
              break;
            case 'Profile':
              iconName = 'account-circle-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DriverHome" component={DriverHomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="MyLoads" component={MyLoadsScreen} options={{ title: 'My Loads' }} />
      <Tab.Screen name="BookedLorries" component={BookedLorriesScreen} options={{ title: 'Booked Lorries' }} />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
        initialParams={{ type: 'driver' }}
      />
    </Tab.Navigator>
  );
};

export default DriverTabNavigator;
