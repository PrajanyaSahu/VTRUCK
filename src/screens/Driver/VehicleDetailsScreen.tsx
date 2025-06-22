import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  TouchableOpacity,
  BackHandler,
  Modal,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'VehicleDetails'>;
  route: RouteProp<RootStackParamList, 'VehicleDetails'>;
};

const VehicleDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { vehicleId } = route.params;
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchVehicleDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`https://2maato.com/api/vehicles/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setVehicle(res.data.data);
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      Alert.alert('Error', 'Could not load vehicle details.');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      const token = await AsyncStorage.getItem('token');
      await axios.delete(`https://2maato.com/api/vehicles/${vehicleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowModal(false);
      Alert.alert('Deleted', 'Vehicle has been deleted.');
      navigation.navigate('ManageVehicles');
    } catch (err) {
      console.error('Delete error:', err);
      Alert.alert('Error', 'Could not delete vehicle.');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchVehicleDetails();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('ManageVehicles');
        return true;
      };
      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [navigation])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#009FFD" />
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.centered}>
        <Text>No vehicle data found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('ManageVehicles')}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back-outline" size={24} color="#009FFD" />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Vehicle Details</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Vehicle Number</Text>
        <Text style={styles.value}>{vehicle.vehicle_number}</Text>

        <Text style={styles.label}>Vehicle Type</Text>
        <Text style={styles.value}>{vehicle.vehicle_type?.title || 'N/A'}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.value}>{vehicle.description || 'N/A'}</Text>

        <Text style={styles.label}>Weight</Text>
        <Text style={styles.value}>{vehicle.weight} kg</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={styles.value}>{vehicle.status}</Text>

        <Text style={styles.label}>Verified</Text>
        <Text style={styles.value}>{vehicle.is_verify === 1 ? 'Yes' : 'No'}</Text>

        <Text style={styles.label}>Operational States</Text>
        {vehicle.operational_states?.length > 0 ? (
          vehicle.operational_states.map((state: any, index: number) => (
            <Text key={index} style={styles.value}>• {state.title}</Text>
          ))
        ) : (
          <Text style={styles.value}>None</Text>
        )}
      </View>
        <TouchableOpacity
        style={styles.editButton}
        onPress={() =>
            navigation.navigate('EditVehicle', {
            vehicleId: vehicle.id,
        })
    }
    >
    <Ionicons name="create-outline" size={18} color="#fff" />
    <Text style={styles.editText}>Edit Vehicle</Text>
    </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="trash-outline" size={18} color="#fff" />
        <Text style={styles.deleteText}>Remove Vehicle</Text>
      </TouchableOpacity>

      <Modal
        transparent
        animationType="fade"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalMessage}>Are you sure you want to delete this vehicle?</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ff4d4d' }]}
                onPress={confirmDelete}
                disabled={deleting}
              >
                <Text style={styles.modalButtonText}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFF',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#009FFD',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    color: '#009FFD',
    marginLeft: 8,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  editButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#009FFD',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  editText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    padding: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VehicleDetailsScreen;
