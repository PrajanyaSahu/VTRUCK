import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios from 'axios';
import GooglePlacesInput from '../../components/GooglePlacesInput';
import {RootStackParamList} from '../../navigation/AppNavigator';
import BidModal from './BidModal';

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

const FindLoadsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'FindLoads'>>();

  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromLocation, setFromLocation] = useState<Location | null>(null);
  const [toLocation, setToLocation] = useState<Location | null>(null);

  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState<
    number | null
  >(null);

  const [fromError, setFromError] = useState(false);
  const [toError, setToError] = useState(false);
  const [vehicleTypeError, setVehicleTypeError] = useState(false);

  const [availableLoads, setAvailableLoads] = useState<any[]>([]);

  const [selectedLoad, setSelectedLoad] = useState<any | null>(null);
  const [isBidModalVisible, setBidModalVisible] = useState(false);

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vehicle-types`, {
          auth: {username: USERNAME, password: PASSWORD},
        });

        const types = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        setVehicleTypes(types);
      } catch (err) {
        console.error('Error fetching vehicle types:', err);
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
      setFromError(false);
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
      setToError(false);
    }
  };

  const handleSubmit = async () => {
    const fromValid = !!fromLocation;
    const toValid = !!toLocation;
    const vehicleValid = !!selectedVehicleTypeId;

    setFromError(!fromValid);
    setToError(!toValid);
    setVehicleTypeError(!vehicleValid);

    if (!fromValid || !toValid || !vehicleValid) return;

    setAvailableLoads([
      {
        id: 1,
        from: fromLocation?.description,
        to: toLocation?.description,
        item_name: 'Steel Rods',
        weight: '20000',
        price: '18000',
        vehicle_type: vehicleTypes.find(v => v.id === selectedVehicleTypeId)
          ?.title,
        status: 'Available',
      },
    ]);
  };

  const handleBidSubmit = (
    type: 'accept' | 'reject' | 'offer',
    bidAmount?: number,
  ) => {
    console.log('Bid Submitted:', type, bidAmount, 'on', selectedLoad);
    setBidModalVisible(false);
    setSelectedLoad(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Ionicons name="arrow-back" size={30} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>FIND LOADS</Text>
        </View>

        <ScrollView keyboardShouldPersistTaps="handled">
          <View style={styles.formContainer}>
            <Text style={styles.label}>Pickup Location</Text>
            <GooglePlacesInput
              placeholder="Enter pickup location"
              value={fromText}
              onChangeText={text => {
                setFromText(text);
                setFromLocation(null);
                setFromError(false);
              }}
              onSelect={handleFromSelect}
              style={[styles.input, fromError && styles.errorBorder]}
            />

            <Text style={styles.label}>Drop-off Location</Text>
            <GooglePlacesInput
              placeholder="Enter drop-off location"
              value={toText}
              onChangeText={text => {
                setToText(text);
                setToLocation(null);
                setToError(false);
              }}
              onSelect={handleToSelect}
              style={[styles.input, toError && styles.errorBorder]}
            />

            <Text style={styles.label}>Select Vehicle type for your load</Text>
            <View
              style={[
                styles.vehicleTypeContainer,
                vehicleTypeError && styles.errorBorder,
              ]}>
              {vehicleTypes.map(type => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.vehicleTypeButton,
                    selectedVehicleTypeId === type.id &&
                      styles.vehicleTypeButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedVehicleTypeId(type.id);
                    setVehicleTypeError(false);
                  }}>
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
              <Text style={styles.buttonText}>Find Loads</Text>
            </TouchableOpacity>

            {availableLoads.length > 0 && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultTitle}>Available Loads:</Text>
                {availableLoads.map((load, index) => (
                  <View key={index} style={styles.lorryCard}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      <Ionicons
                        name="cube-outline"
                        size={36}
                        color="#007bff"
                        style={{marginRight: 12}}
                      />
                      <View style={{flex: 1}}>
                        <Text style={styles.lorryTitle}>{load.item_name}</Text>
                        <Text style={styles.lorrySub}>From: {load.from}</Text>
                        <Text style={styles.lorrySub}>To: {load.to}</Text>
                        <Text style={styles.lorrySub}>
                          Weight: {load.weight} kg
                        </Text>
                        <Text style={styles.lorrySub}>
                          Vehicle: {load.vehicle_type}
                        </Text>
                        <Text style={styles.lorrySub}>
                          Price: ₹{load.price}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => {
                          setSelectedLoad(load);
                          setBidModalVisible(true);
                        }}>
                        <Text style={styles.bookButtonText}>Bid</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
            {/* REMOVE THIS PART WHEN GOT API */}
            <View style={{alignItems: 'center', marginBottom: 10}}>
              <Text style={{fontSize: 16, color: '#666'}}>
                This is PlaceHolder Screen
              </Text>
            </View>
            {/* TILL HERE */}
          </View>
          <BidModal
            visible={isBidModalVisible}
            onClose={() => setBidModalVisible(false)}
            onSubmit={handleBidSubmit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FindLoadsScreen;

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
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorBorder: {
    borderColor: 'red',
    borderWidth: 1.5,
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    borderRadius: 8,
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
  formContainer: {
    padding: 16,
    paddingBottom: 40,
  },
});
