import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp, useFocusEffect} from '@react-navigation/native';
import type {RootStackParamList} from '../../navigation/AppNavigator';

type ManageVehiclesProps = {
  navigation: StackNavigationProp<RootStackParamList, 'ManageVehicles'>;
  route: RouteProp<RootStackParamList, 'ManageVehicles'>;
};

type Vehicle = {
  id: number;
  vehicle_number: string;
  type: string;
};

const ManageVehiclesScreen: React.FC<ManageVehiclesProps> = ({navigation}) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);

  const fetchVehicles = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const type = await AsyncStorage.getItem('userType');
      setUserType(type);

      const res = await axios.get('https://2maato.com/api/vehicles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVehicles(res.data?.data || []);
    } catch (error) {
      console.error('Fetch vehicles error:', error);
      Alert.alert('Error', 'Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchVehicles);
    return unsubscribe;
  }, [navigation]);
  const renderItem = ({item}: {item: Vehicle}) => (
    <TouchableOpacity
      style={styles.vehicleCard}
      onPress={async () => {
        try {
          await AsyncStorage.setItem('selectedVehicleId', item.id.toString());
          Alert.alert(
            'Vehicle Selected',
            `Vehicle ${item.vehicle_number} selected for finding loads.`,
            [
              {
                text: 'Go to Find Load',
                onPress: () => navigation.navigate('FindLoad'),
              },
              {text: 'Cancel', style: 'cancel'},
            ],
          );
        } catch (err) {
          console.error('Error saving selected vehicle ID:', err);
        }
      }}>
      <Ionicons
        name="car-outline"
        size={24}
        color="#009FFD"
        style={styles.icon}
      />
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleNumber}>{item.vehicle_number}</Text>
        <Text style={styles.vehicleType}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

return (
  <View style={styles.container}>
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.heading}>MY VEHICLES</Text>
    </View>

    {loading ? (
      <ActivityIndicator size="large" color="#009FFD" style={{ marginTop: 20 }} />
    ) : (
      <View style={styles.contentWrapper}>
        {vehicles.length === 0 ? (
          <Text style={{ marginTop: 20 }}>No vehicles added yet.</Text>
        ) : (
          <FlatList
            data={vehicles}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('AddVehicle', {
              selectedRoutes: [],
              formData: {},
            })
          }>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  contentWrapper: {
  padding: 20,
},
  headerContainer: {
    backgroundColor: '#007BFF',
    height:100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    marginBottom:1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 1,
  },
  icon: {
    marginRight: 12,
  },
  vehicleInfo: {
    justifyContent: 'center',
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vehicleType: {
    fontSize: 13,
    color: '#555',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    justifyContent: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
});

export default ManageVehiclesScreen;
