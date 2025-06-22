import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

const BASE_URL = 'https://2maato.com/api';

type Vehicle = {
  id: number;
  vehicle_number: string;
  vehicle_type: string;
};

type User = {
  kyc_status: 'pending' | 'verified' | 'rejected' | null;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'VehicleListScreen'>;

const VehicleListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const userRes = await axios.get(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser({ kyc_status: userRes.data.kyc_status });

      const res = await axios.get(`${BASE_URL}/transporter/vehicles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(res.data.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      Alert.alert('Error', 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchVehicles);
    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2176ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>My Vehicles</Text>

      {vehicles.length === 0 ? (
        <Text style={styles.noVehiclesText}>No vehicles found.</Text>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 130 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.row}>
                <Ionicons name="car" size={22} color="#2176ff" />
                <Text style={styles.label}> {item.vehicle_number}</Text>
              </View>
              <Text style={styles.subText}>Type: {item.vehicle_type}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity
        style={[
          styles.addButton,
          user?.kyc_status !== 'verified' && { backgroundColor: '#ccc' },
        ]}
        onPress={() => {
          if (user?.kyc_status === 'verified') {
            navigation.navigate('AddVehicle', {
              formData: {},
              selectedRoutes: [],
              vehicle: undefined,
            });
          } else {
            Alert.alert('KYC Required', 'Please complete KYC before adding vehicles.');
          }
        }}
        disabled={user?.kyc_status !== 'verified'}
      >
        <Ionicons name="car-outline" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add Vehicle</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VehicleListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FE', padding: 16 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noVehiclesText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 28,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#2176ff',
    padding: 14,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 80,
    alignSelf: 'center',
    width: '90%',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
});
