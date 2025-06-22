import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GooglePlacesInput from '../../components/GooglePlacesInput';
import {RootStackParamList} from '../../navigation/AppNavigator';

const API_KEY = 'AIzaSyBtHbi7VedBLnRVP9ph10ziegxlgfue-ZQ';
const BASE_URL = 'https://2maato.com/api';
const USERNAME = 'vtruck';
const PASSWORD = 'secret@123';

type Location = {
  description: string;
  place_id: string;
  latitude: number;
  longitude: number;
};

const FindLorryScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'FindLorry'>>();

  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);

  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<
    number | null
  >(null);

  const [lorries, setLorries] = useState<any[]>([]);

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const credentials = `${USERNAME}:${PASSWORD}`;

        const res = await axios.get(`${BASE_URL}/vehicle-types`, {
          auth: {username: 'vtruck', password: 'secret@123'},
        });

        const types = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        setVehicleTypes(types);
      } catch (err) {
        console.error('Error fetching vehicle types:', err);
        Alert.alert('Error', 'Could not fetch vehicle types');
      }
    };

    fetchVehicleTypes();
  }, []);

  const getCoordinates = async (placeId: string) => {
    try {
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${API_KEY}`,
      );
      const loc = res.data?.result?.geometry?.location;
      return loc ? {lat: loc.lat, lng: loc.lng} : null;
    } catch (error) {
      console.error('Error fetching place details:', error);
      return null;
    }
  };

  const handleFromSelect = async (place: {
    description: string;
    place_id: string;
  }) => {
    const coords = await getCoordinates(place.place_id);
    if (coords) {
      setFromLocation({
        description: place.description,
        place_id: place.place_id,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      setFromText(place.description);
    } else {
      Alert.alert('Error', 'Could not fetch coordinates for pickup location');
    }
  };

  const handleToSelect = async (place: {
    description: string;
    place_id: string;
  }) => {
    const coords = await getCoordinates(place.place_id);
    if (coords) {
      setToLocation({
        description: place.description,
        place_id: place.place_id,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      setToText(place.description);
    } else {
      Alert.alert('Error', 'Could not fetch coordinates for drop-off location');
    }
  };

  const handleSubmit = async () => {
    if (!fromLocation || !toLocation || !selectedVehicleTypeId) {
      Alert.alert('Error', 'Please fill all fields and select vehicle type');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/find-lorry`, {
        params: {
          pick_lat: fromLocation.latitude,
          pick_lng: fromLocation.longitude,
          drop_lat: toLocation.latitude,
          drop_lng: toLocation.longitude,
          vehicle_type_id: selectedVehicleTypeId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const results = response.data;
      if (results && results.length > 0) {
        setLorries(results);
      } else {
        Alert.alert('No Lorries Found', 'Showing placeholder for testing.');
        setLorries([
          {
            id: 0,
            vehicle_number: 'GJ05SG3434',
            driver_name: 'Larry Walter',
            capacity: '42000',
            address: '1600 Amphitheatre Pkwy, Mountain View, CA',
            image: null,
            isPlaceholder: true,
          },
        ]);
      }
    } catch (error) {
      console.error('API error:', error);
      Alert.alert('Error', 'Failed to find lorries');
      setLorries([]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title}>FIND LORRY</Text>
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Pickup Location</Text>
            <GooglePlacesInput
              placeholder="Enter pickup location"
              value={fromText}
              onChangeText={text => {
                setFromText(text);
                setFromLocation(null);
              }}
              onSelect={handleFromSelect}
            />

            <Text style={styles.label}>Drop-off Location</Text>
            <GooglePlacesInput
              placeholder="Enter drop-off location"
              value={toText}
              onChangeText={text => {
                setToText(text);
                setToLocation(null);
              }}
              onSelect={handleToSelect}
            />

            <Text style={styles.label}>Select Vehicle type for your load</Text>
            <View style={styles.vehicleTypeContainer}>
              {vehicleTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.vehicleTypeButton,
                    selectedVehicleTypeId === type.id &&
                      styles.vehicleTypeButtonSelected,
                  ]}
                  onPress={() => setSelectedVehicleTypeId(type.id)}>
                  <Text
                    style={[
                      styles.vehicleTypeText,
                      selectedVehicleTypeId === type.id &&
                        styles.vehicleTypeTextSelected,
                    ]}>
                    {type.title}
                    {'\n'}
                    {type.min_weight} - {type.max_weight} kg
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Find Lorries</Text>
            </TouchableOpacity>
          </View>
          {lorries.length > 0 && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultTitle}>Available Lorries:</Text>
              {lorries.map((lorry, index) => (
                <View key={index} style={styles.lorryCard}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {/* Optional image */}
                    <Ionicons
                      name="bus-outline"
                      size={36}
                      color="#007bff"
                      style={{marginRight: 12}}
                    />

                    <View style={{flex: 1}}>
                      <Text style={styles.lorryTitle}>
                        {lorry.vehicle_number}
                      </Text>
                      <Text style={styles.lorrySub}>
                        Driver: {lorry.driver_name}
                      </Text>
                      <Text style={styles.lorrySub}>
                        Capacity: {lorry.capacity} kg
                      </Text>
                      <Text style={styles.lorrySub}>
                        Location: {lorry.address}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookButton}
                      onPress={() => {
                        if (fromLocation && toLocation) {
                          navigation.navigate('BookLorry', {
                            lorry,
                            from: fromLocation,
                            to: toLocation,
                          });
                        } else {
                          // show error or ignore
                          console.warn(
                            'Please select both from and to locations.',
                          );
                        }
                      }}>
                      <Text style={styles.bookButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FindLorryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{translateY: -12}],
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#007bff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginTop: 12,
    marginBottom: 6,
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  vehicleTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  vehicleTypeButtonSelected: {
    backgroundColor: '#007bff',
  },
  vehicleTypeText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#333',
  },
  vehicleTypeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 30,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0057e7',
  },
  lorryCard: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  lorryText: {
    fontSize: 14,
    color: '#333',
  },

  lorryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },

  lorrySub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  bookButton: {
    backgroundColor: '#007bff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
