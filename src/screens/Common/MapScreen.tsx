import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  PermissionsAndroid,
  Alert,
  Keyboard,
  useWindowDimensions,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Region} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import GooglePlacesInput from '../../components/GooglePlacesInput';
import {StackScreenProps} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';

const GOOGLE_API_KEY = 'AIzaSyBtHbi7VedBLnRVP9ph10ziegxlgfue-ZQ';

type MapScreenProps = StackScreenProps<RootStackParamList, 'MapScreen'>;

const MapScreen: React.FC<MapScreenProps> = ({navigation, route}) => {
  const [region, setRegion] = useState<Region>({
    latitude: 22.9734,
    longitude: 78.6569,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [currentAddress, setCurrentAddress] = useState('');
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [suppressMapUpdate, setSuppressMapUpdate] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const mapDraggedRef = useRef(false);
  const mapRef = useRef<MapView | null>(null);
  const {height: windowHeight} = useWindowDimensions();

  const {
    field,
    userType,
    pickupLocation,
    pickupLat,
    pickupLng,
    dropoffLocation,
    dropoffLat,
    dropoffLng,
  } = route.params;

  useEffect(() => {
    requestLocationPermission();

    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to use this feature.',
          );
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;

        const newRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);
        fetchAddress(latitude, longitude);
      },
      err => {
        console.log('Location error', err);
        Alert.alert('Error', 'Unable to fetch location.');
      },
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  };

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
      );

      const address =
        response.data.results?.find(
          (res: any) =>
            res.types.includes('premise') ||
            res.types.includes('sublocality') ||
            res.types.includes('route'),
        )?.formatted_address ||
        response.data.results?.[0]?.formatted_address ||
        '';

      setCurrentAddress(address);
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleRegionChange = (r: Region) => {
    setRegion(r);
    if (!isUserEditing && !suppressMapUpdate && mapDraggedRef.current) {
      fetchAddress(r.latitude, r.longitude);
    }
  };

  const confirmLocation = () => {
    const params = route.params as any;

    const payload: any = {
      field: params.field,
      userType: params.userType,
      pickupLocation: params.pickupLocation,
      pickupLat: params.pickupLat,
      pickupLng: params.pickupLng,
      dropoffLocation: params.dropoffLocation,
      dropoffLat: params.dropoffLat,
      dropoffLng: params.dropoffLng,
    };

    if (params.field === 'pickup') {
      payload.pickupLocation = currentAddress;
      payload.pickupLat = region.latitude;
      payload.pickupLng = region.longitude;
    } else {
      payload.dropoffLocation = currentAddress;
      payload.dropoffLat = region.latitude;
      payload.dropoffLng = region.longitude;
    }

    navigation.navigate('AddLoad', payload);
  };

  return (
    <View style={{flex: 1}}>
      <MapView
        ref={mapRef}
        style={{flex: 1}}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        onPanDrag={() => {
          mapDraggedRef.current = true;
          setSuppressMapUpdate(false);

          // Delay resetting editing flag to allow region change to process
          setTimeout(() => {
            setIsUserEditing(false);
          }, 100); // slight delay ensures `handleRegionChange` sees updated state
        }}
        mapType="standard"
        customMapStyle={[]}
      />

      <Text
        style={[
          styles.pin,
          {
            top: windowHeight / 2 - 28 + (keyboardVisible ? -140 : 0),
          },
        ]}>
        📍
      </Text>

      <View style={styles.topSearchBox}>
        <GooglePlacesInput
          placeholder="Search location"
          value={currentAddress}
          onChangeText={text => {
            setCurrentAddress(text);

            if (text === '') {
              setIsUserEditing(true);
              setSuppressMapUpdate(true);
              mapDraggedRef.current = false;
            } else {
              setIsUserEditing(true);
            }
          }}
          onSelect={async place => {
            setIsUserEditing(false);
            setSuppressMapUpdate(false);
            mapDraggedRef.current = false;
            setCurrentAddress(place.description);

            const coords = await axios.get(
              `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_API_KEY}`,
            );
            const {lat, lng} = coords.data.result.geometry.location;
            const newRegion = {
              latitude: lat,
              longitude: lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            };
            mapRef.current?.animateToRegion(newRegion);
            setRegion(newRegion);
          }}
        />
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmBtn} onPress={confirmLocation}>
            <Text style={{color: '#fff'}}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  pin: {
    position: 'absolute',
    left: Dimensions.get('window').width / 2 - 14,
    fontSize: 28,
    zIndex: 999,
  },
  topSearchBox: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 12,
    right: 12,
    borderRadius: 12,
    padding: 0,
    zIndex: 9999,
    backgroundColor: 'transparent',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    elevation: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 10,
    marginLeft: 8,
    alignItems: 'center',
  },
});

export default MapScreen;
