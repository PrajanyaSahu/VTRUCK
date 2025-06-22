import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ShipperHomeScreen from '../screens/Shipper/ShipperHomeScreen';
import MyLoadsScreen from '../screens/Shipper/MyLoadsScreenS';
import BookedLorriesScreen from '../screens/Shipper/BookedLorriesScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';
import {useTranslation} from 'react-i18next';

const Tab = createBottomTabNavigator();
const ShipperTabNavigator = () => {
  const {t} = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007BFF',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {backgroundColor: '#fff', height: 70, paddingBottom: 10},
        tabBarLabelStyle: {fontSize: 12},
      }}>
      <Tab.Screen
        name="ShipperHome"
        component={ShipperHomeScreen}
        options={{
          tabBarLabel: t('home'),
          tabBarIcon: ({color}) => (
            <Icon name="home-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="MyLoads"
        component={MyLoadsScreen}
        options={{
          tabBarLabel: t('my_loads'),
          tabBarIcon: ({color}) => (
            <Icon name="truck-delivery-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="BookedLorries"
        component={BookedLorriesScreen}
        options={{
          tabBarLabel: t('booked_lorries'),
          tabBarIcon: ({color}) => (
            <Icon name="truck-outline" size={24} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{type: 'Shipper'}}
        options={{
          tabBarLabel: t('profile'),
          tabBarIcon: ({color}) => (
            <Icon name="account-circle-outline" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default ShipperTabNavigator;
