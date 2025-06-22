import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import FindLorryScreen from '../screens/Shipper/FindLorryScreen';
import SplashScreen from '../screens/Common/SplashScreen';
import LoginScreen from '../screens/Common/LoginScreen';
import SignupScreen from '../screens/Common/SignupScreen';
import OTPScreen from '../screens/Common/OTPScreen';
import LoadDetailsScreenS from '../screens/Shipper/LoadDetailsScreenS';
import AddLoadScreen from '../screens/Shipper/AddLoadScreen';
import ProfileScreen from '../screens/Common/ProfileScreen';
import KYCScreen from '../screens/Common/KYCScreen';
import DriverTabNavigator from './DriverTabNavigator';
import MapScreen from '../screens/Common/MapScreen';
import AddVehicleScreen from '../screens/Common/AddVehicleScreen';
import SelectRouteStatesScreen from '../screens/Driver/SelectRouteStatesScreen';
import ManageVehiclesScreen from '../screens/Driver/ManageVehiclesScreen';
import VehicleDetailsScreen from '../screens/Driver/VehicleDetailsScreen';
import EditVehicle from '../screens/Driver/EditVehicleScreen';
import AddDriverScreen from '../screens/Transporter/AddDriverScreen';
import VehicleListScreen from '../screens/Transporter/VehicleListScreen';
import DriverListScreen from '../screens/Transporter/DriverListScreen';
import DriverDetailsScreen from '../screens/Transporter/DriverDetailsScreen';
import FindLoadScreen from '../screens/Common/FindLoadScreen';
import BidsScreen from '../screens/Shipper/BidsScreen';
import TransporterTabs from './TransporterTabs';
import ShipperTabNavigator from './ShipperTabNavigator';
import BookLorryScreen from '../screens/Shipper/BookLorryScreen';
import NearbyLoadsScreen from '../screens/Common/NearbyLoadsScreen';
import TrackLoadScreen from '../screens/Common/TrackLoadScreen';
import LoadDetailsScreen from '../screens/Common/LoadDetailsScreenD';
import AssignDriverScreen from '../screens/Transporter/AssignDriverScreen';
import StateLoadListScreen from '../screens/Common/StateLoadListScreen';
import StateLorryListScreen from '../screens/Shipper/StateLorryListScreen';


type Driver = {
  id: number;
  name: string;
  phone: string;
  profile_photo_url: string;
};

type Load = {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  material_name: string;
  description?: string;
  weight: string;
  amount: number;
  load_status: string;
  pick_lat?: number;
  pick_lng?: number;
  drop_lat?: number;
  drop_lng?: number;
  created_at?: string;
  bids?: {
    id: number;
    bid_amount: string;
    status: string;
    user: {
      name: string;
    };
    vehicle: {
      vehicle_number: string;
    };
  }[];
  accepted_bid?: {
    driver_name: string;
    bid_amount: string;
  } | null;
};
export type ShipperTabParamList = {
  Home: undefined;
  MyLoads: undefined;
  Profile: undefined;
};
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Signup: undefined;
  OTP: {phone: string; userType?: string};
  ServiceType: undefined;
  ShipperTabs: {screen?: keyof ShipperTabParamList} | undefined;
  TransporterTabs: undefined;
  AddLoad: {
    userType: string;
    pickupLocation?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLocation?: string;
    dropoffLat?: number;
    dropoffLng?: number;
  };
  MapScreen: {
    field: 'pickup' | 'dropoff';
    sourceScreen: 'AddLoad' | 'FindLorry';
    userType: string;
    pickupLocation?: string;
    pickupLat?: number;
    pickupLng?: number;
    dropoffLocation?: string;
    dropoffLat?: number;
    dropoffLng?: number;
  };
  Notifications: undefined;
  Profile: {type: string};
  LoadDetailsScreenS: {load: any};
  LoadDetailsScreenD: {load: any};
  UserDetails: {userId: string; userType: string};
  DriverHome: undefined;
  KYC: undefined;
  Tracking: undefined;
  TrackingMap: {load: any};
  AddVehicle: {
    selectedRoutes?: number[];
    formData: any;
    vehicle?: {
      id: number;
      vehicle_number: string;
      type: string;
      [key: string]: any;
    };
  };
  ManageVehicles: undefined;
  VehicleDetails: {vehicleId: number};
  EditVehicle: {vehicleId: number};
  SelectRouteStates: {selected: number[]; formData: any};
  VehicleListScreen: undefined;
  DriverListScreen: undefined;
  Drivers: undefined;
  FindLoad: undefined;
  BidsScreen: {loadId: number};
  MapPickerScreen: {
    from: {
      description: string;
      latitude: number;
      longitude: number;
    };
    to: {
      description: string;
      latitude: number;
      longitude: number;
    };
  };
  AddDriverScreen: undefined;
  AssignDriverScreen: {loadId: number};
  DriverDetailsScreen: {driver: Driver};
  FindLorry: undefined;
  BookLorry: {
    lorry: any;
    from: {description: string};
    to: {description: string};
  };
  NearbyLoads: undefined;
  FindLoads: undefined;
  TrackLoadScreen: {
    mode: 'pickup' | 'dropoff';
    pickup_location: {latitude: number; longitude: number};
    dropoff_location: {latitude: number; longitude: number};
  };
  StateLoadList: { state: string };
  StateLorryList: { state: string }
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
    <Stack.Screen name="OTP" component={OTPScreen} />
    <Stack.Screen name="ShipperTabs" component={ShipperTabNavigator} />
    <Stack.Screen name="LoadDetailsScreenS" component={LoadDetailsScreenS} />
    <Stack.Screen name="AddLoad" component={AddLoadScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="KYC" component={KYCScreen} />
    <Stack.Screen name="MapScreen" component={MapScreen} />
    <Stack.Screen name="DriverHome" component={DriverTabNavigator} />
    <Stack.Screen name="AddVehicle" component={AddVehicleScreen} />
    <Stack.Screen
      name="SelectRouteStates"
      component={SelectRouteStatesScreen}
    />
    <Stack.Screen name="ManageVehicles" component={ManageVehiclesScreen} />
    <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
    <Stack.Screen name="EditVehicle" component={EditVehicle} />
    <Stack.Screen name="VehicleListScreen" component={VehicleListScreen} />
    <Stack.Screen name="DriverListScreen" component={DriverListScreen} />
    <Stack.Screen name="DriverDetailsScreen" component={DriverDetailsScreen} />
    <Stack.Screen name="FindLoad" component={FindLoadScreen} />
    <Stack.Screen name="AddDriverScreen" component={AddDriverScreen} />
    <Stack.Screen name="BidsScreen" component={BidsScreen} />
    <Stack.Screen name="TransporterTabs" component={TransporterTabs} />
    <Stack.Screen
      name="FindLorry"
      component={FindLorryScreen}
      options={{title: 'Find Lorry'}}
    />
    <Stack.Screen name="BookLorry" component={BookLorryScreen} />
    <Stack.Screen name="NearbyLoads" component={NearbyLoadsScreen} />
    <Stack.Screen
      name="TrackLoadScreen"
      component={TrackLoadScreen}
      options={{title: 'Track Load'}}
    />
    <Stack.Screen
      name="LoadDetailsScreenD"
      component={LoadDetailsScreen}
      options={{title: 'Load Details'}}
    />
    <Stack.Screen name="AssignDriverScreen" component={AssignDriverScreen} />
    <Stack.Screen name="StateLoadList" component={StateLoadListScreen} />
    <Stack.Screen
  name="StateLorryList"
  component={StateLorryListScreen}
  options={{ title: 'Lorry List' }}
/>
  </Stack.Navigator>
);

export default AppNavigator;
