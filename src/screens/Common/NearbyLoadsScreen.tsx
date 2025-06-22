import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Geolocation from '@react-native-community/geolocation';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BidModal from '../Common/BidModal';
import {RootStackParamList} from '../../navigation/AppNavigator';
import Slider from '@react-native-community/slider';
import {useFocusEffect} from '@react-navigation/native';
import {useCallback} from 'react';

const BASE_URL = 'https://2maato.com/api';
const PER_PAGE = 10;

type Load = RootStackParamList['LoadDetailsScreenD']['load'];
type NavigationProp = StackNavigationProp<RootStackParamList, 'FindLoad'>;

const NearbyLoadsScreen = () => {
  const [kycStatus, setKycStatus] = useState<
    'pending' | 'verified' | 'rejected' | null
  >(null);
  const [showKycModal, setShowKycModal] = useState(false);
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleSelectionVisible, setVehicleSelectionVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [submittingBid, setSubmittingBid] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const [radius, setRadius] = useState(50);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      init();
    }, []),
  );

  const init = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const meRes = await axios.get(`${BASE_URL}/me`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const status = meRes.data?.kyc_status || null;
      setKycStatus(status);

      if (status !== 'verified') {
        setShowKycModal(true);
        setLoading(false);
        return;
      }

      const res = await axios.get(`${BASE_URL}/vehicles`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      const fetchedVehicles = (res.data?.data || []).filter(
        (v: any) => v.status === 'available',
      );

      if (fetchedVehicles.length === 0) {
        Alert.alert('No vehicles found', 'Please add a vehicle first.');
        setLoading(false);
        return;
      }

      setVehicles(fetchedVehicles);

      setVehicleSelectionVisible(true);
      setLoading(false);
    } catch (error) {
      console.error('Init error:', error);
      Alert.alert('Error', 'Failed to initialize screen.');
      setLoading(false);
    }
  };

  const handleVehicleSelect = async (vehicle: any) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await requestLocationPermission();
      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          setUserLocation({lat: latitude, lng: longitude});
          await axios.put(
            `${BASE_URL}/vehicles/${vehicle.id}`,
            {
              curr_location: 'Madhya Pradesh',
              curr_lat: latitude,
              curr_lng: longitude,
            },
            {
              headers: {Authorization: `Bearer ${token}`},
            },
          );
          setVehicleId(vehicle.id);
          fetchLoads(vehicle.id, 1, true);
        },
        error => {
          console.error('Location error:', error);
          Alert.alert('Error', 'Unable to fetch location');
          setLoading(false);
        },
        {enableHighAccuracy: false, timeout: 10000},
      );
    } catch (err) {
      console.error('handleVehicleSelect error:', err);
      Alert.alert('Error', 'Vehicle initialization failed');
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error('Location permission denied');
      }
    }
  };

  const fetchLoads = async (vehId: number, pageNum: number, reset = false) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/find-loads`, {
        params: {vehicle_id: vehId, page: pageNum, per_page: PER_PAGE, radius},
        headers: {Authorization: `Bearer ${token}`},
      });

      let newLoads: Load[] = Array.isArray(response.data?.data)
        ? response.data.data
        : [];
      const allLoads = reset ? newLoads : [...loads, ...newLoads];
      setLoads(allLoads);
    } catch (error: any) {
      console.error(
        'Fetch loads error:',
        error?.response?.data?.message || error?.message || 'Unknown error',
      );
      Alert.alert('Error', 'Failed to fetch loads. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateDistance = (
    lat1?: number,
    lon1?: number,
    lat2?: number,
    lon2?: number,
  ): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const toRad = (value: number): number => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const submitBid = async (amount: number) => {
    if (!selectedLoad || !vehicleId) return;
    try {
      setSubmittingBid(true);
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/bid/${selectedLoad.id}`,
        {
          load_id: selectedLoad.id,
          vehicle_id: vehicleId,
          bid_amount: amount,
          description: '',
        },
        {
          headers: {Authorization: `Bearer ${token}`},
        },
      );
      Alert.alert('Success', 'Bid placed successfully');
    } catch (err) {
      console.error('Bid error:', err);
      Alert.alert('Error', 'Failed to place bid');
    } finally {
      setSubmittingBid(false);
      setBidModalVisible(false);
    }
  };

  const handleRefresh = () => {
    if (vehicleId) {
      setRefreshing(true);
      fetchLoads(vehicleId, 1, true);
      setPage(1);
    }
  };

  const handleLoadMore = () => {
    if (vehicleId) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLoads(vehicleId, nextPage);
    }
  };

  const extractCityState = (full: string) => {
    const parts = full.split(',');
    return parts.slice(0, 2).join(', ');
  };

  const formatDate = (iso?: string): string => {
    if (!iso) return 'Unknown date';
    const date = new Date(iso);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading && !vehicleSelectionVisible) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      {!loads.length && !loading && (
        <Text style={{textAlign: 'center', marginTop: 20}}>No loads found</Text>
      )}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>NEARBY LOADS</Text>
        </View>
        <View style={{width: 24}} />
      </View>
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>Search Radius: {radius} km</Text>
        <Slider
          style={{width: '100%', height: 40}}
          minimumValue={50}
          maximumValue={200}
          step={10}
          value={radius}
          minimumTrackTintColor="#009FFD"
          maximumTrackTintColor="#ccc"
          thumbTintColor="#009FFD"
          onValueChange={value => setRadius(value)}
        />
      </View>
      <FlatList
        data={loads}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.subText}>{formatDate(item.created_at)}</Text>
            <View style={styles.route}>
              <Ionicons name="location" size={14} color="green" />
              <Text style={styles.location}>
                {extractCityState(item.pickup_location)}
              </Text>
            </View>
            <View style={styles.route}>
              <Ionicons name="location" size={14} color="red" />
              <Text style={styles.location}>
                {extractCityState(item.dropoff_location)}
              </Text>
            </View>
            <Text style={styles.distance}>
              Distance:{' '}
              {calculateDistance(
                item.pick_lat,
                item.pick_lng,
                item.drop_lat,
                item.drop_lng,
              )}{' '}
              km
            </Text>
            <View style={styles.row}>
              <Text style={styles.label}>Item</Text>
              <Text style={styles.label}>Price/ton</Text>
              <Text style={styles.label}>Weight</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>{item.material_name}</Text>
              <Text style={styles.value}>₹{item.amount}</Text>
              <Text style={styles.value}>{item.weight} kg</Text>
            </View>
            <TouchableOpacity
              style={styles.bidButton}
              onPress={() => {
                setSelectedLoad(item);
                setBidModalVisible(true);
              }}>
              <Text style={styles.bidButtonText}>Bid / Accept</Text>
            </TouchableOpacity>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {BidModal && (
        <BidModal
          visible={bidModalVisible}
          onClose={() => setBidModalVisible(false)}
          onSubmit={(action, offerAmount) => {
            if (action === 'accept') Alert.alert('Accepted', 'Load accepted');
            else if (action === 'offer' && offerAmount) submitBid(offerAmount);
          }}
        />
      )}

      {vehicleSelectionVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select a Vehicle</Text>
            <FlatList
              data={vehicles}
              keyExtractor={v => v.id.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.vehicleCard}
                  onPress={() => {
                    setVehicleSelectionVisible(false);
                    setLoading(true);
                    handleVehicleSelect(item);
                  }}>
                  <Text style={styles.vehicleNumber}>
                    {item.vehicle_number || 'No Number'}
                  </Text>
                  <Text style={styles.vehicleMeta}>
                    Type: {item.vehicle_type?.title || 'Unknown'}
                  </Text>
                  <Text style={styles.vehicleMeta}>
                    Weight: {item.min_weight}kg - {item.max_weight}kg
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={{width: '100%'}}
            />
          </View>
        </View>
      )}

      {showKycModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.kycModalBox}>
            <Text style={styles.kycModalTitle}>KYC Verification Required</Text>
            <Text style={styles.kycModalSubtitle}>
              To access loads and place bids, please complete your KYC process.
            </Text>

            <TouchableOpacity
              style={styles.kycButton}
              onPress={() => {
                setShowKycModal(false);
              }}>
              <Text style={styles.kycButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 4,
  },
  header: {fontSize: 14, fontWeight: 'bold', color: '#333'},
  subText: {fontSize: 13, color: '#666', marginBottom: 8},
  route: {flexDirection: 'row', alignItems: 'center', marginBottom: 4},
  location: {marginLeft: 6, fontSize: 14, color: '#444'},
  distance: {fontSize: 12, color: '#999', marginTop: 6},
  row: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 10},
  label: {fontSize: 12, color: '#888', flex: 1, textAlign: 'center'},
  value: {fontSize: 14, color: '#222', flex: 1, textAlign: 'center'},
  bidButton: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#28a745',
    borderRadius: 8,
    alignItems: 'center',
  },
  bidButtonText: {color: '#fff', fontSize: 14, fontWeight: 'bold'},
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  modalBox: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#007bff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  vehicleCard: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  vehicleMeta: {fontSize: 13, color: '#555'},
  kycModalBox: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },

  kycModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },

  kycModalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  kycButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'stretch',
  },

  kycButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height:100,
    paddingHorizontal: 16,
    backgroundColor: '#007bff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  sliderContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sliderLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    fontWeight: '500',
  },
});
export default NearbyLoadsScreen;
