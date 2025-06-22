import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { RouteProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/AppNavigator';

type DriverDetailsScreenRouteProp = RouteProp<RootStackParamList, 'DriverDetailsScreen'>;

type Props = {
  route: DriverDetailsScreenRouteProp;
};

const BASE_URL = 'https://2maato.com/api';

const DriverDetailsScreen: React.FC<Props> = ({ route }) => {
  const { driver } = route.params;
  const navigation = useNavigation();

  const handleDelete = async () => {
    Alert.alert('Delete Driver', 'Are you sure you want to delete this driver?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            await axios.delete(`${BASE_URL}/drivers/${driver.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            Alert.alert('Deleted', 'Driver has been deleted.');
            navigation.goBack();
          } catch (error) {
            console.error('Error deleting driver:', error);
            Alert.alert('Error', 'Failed to delete driver. Try again.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: driver.profile_photo_url }}
        style={styles.profileImage}
      />
      <Text style={styles.name}>{driver.name}</Text>
      <Text style={styles.phone}>📞 {driver.phone}</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => Alert.alert('Edit', 'Edit functionality coming soon')}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DriverDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fa',
    alignItems: 'center',
    paddingTop: 40,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ddd',
    marginBottom: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  phone: {
    fontSize: 16,
    color: '#666',
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: '#2176ff',
  },
  deleteButton: {
    backgroundColor: '#d9534f',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
});
