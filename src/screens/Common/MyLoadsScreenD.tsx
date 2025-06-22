import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RootStackParamList} from '../../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TrackLoadScreen'
>;

const MyLoadsScreenD = () => {
  const navigation = useNavigation<NavigationProp>();

  const [loads, setLoads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [vehicleId, setVehicleId] = useState<number | null>(null);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleSelectionVisible, setVehicleSelectionVisible] = useState(false);
  const [userType, setUserType] = useState<
    'shipper' | 'driver' | 'transporter' | null
  >(null);
  const [selectedTab, setSelectedTab] = useState<
    'pending' | 'assigned' | 'accepted'
  >('pending');

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const role = await AsyncStorage.getItem('userType');
      setUserType(role as any);

      const fetchedVehicles = [
        {
          id: 1,
          vehicle_number: 'MH12AB1234',
          vehicle_type: {title: 'Truck'},
          min_weight: 1000,
          max_weight: 5000,
        },
        {
          id: 2,
          vehicle_number: 'DL09XY5678',
          vehicle_type: {title: 'Mini Truck'},
          min_weight: 500,
          max_weight: 2000,
        },
      ];

      setVehicles(fetchedVehicles);

      const storedId = await AsyncStorage.getItem('selectedVehicleId');
      const parsedId = storedId ? parseInt(storedId) : null;
      const validVehicle = fetchedVehicles.find((v: any) => v.id === parsedId);

      if (!parsedId || !validVehicle) {
        await AsyncStorage.removeItem('selectedVehicleId');
        setVehicleSelectionVisible(true);
        setLoading(false);
        return;
      }

      setVehicleId(parsedId);
      fetchMyLoads(parsedId, 1, true);
    } catch (e) {
      console.error('Init error:', e);
      Alert.alert('Error', 'Initialization failed.');
      setLoading(false);
    }
  };

  const handleVehicleSelect = async (vehicle: any) => {
    try {
      setVehicleSelectionVisible(false);
      setLoading(true);
      const id = vehicle.id;
      await AsyncStorage.setItem('selectedVehicleId', String(id));
      setVehicleId(id);
      fetchMyLoads(id, 1, true);
    } catch (err) {
      console.error('Vehicle select error:', err);
      Alert.alert('Error', 'Vehicle selection failed.');
      setLoading(false);
    }
  };

  const fetchMyLoads = async (
    vehId: number,
    pageNum: number,
    reset = false,
  ) => {
    try {
      const dummyLoads = [
        {
          id: 101,
          material_name: 'Steel Pipes',
          created_at: new Date().toISOString(),
          pickup_location: 'Mumbai, Maharashtra, India',
          dropoff_location: 'Pune, Maharashtra, India',
          load_status: 'pending',
        },
        {
          id: 102,
          material_name: 'Cement Bags',
          created_at: new Date().toISOString(),
          pickup_location: 'Delhi, India',
          dropoff_location: 'Jaipur, Rajasthan, India',
          load_status: userType === 'transporter' ? 'accepted' : 'assigned',
        },
        {
          id: 103,
          material_name: 'Iron Rods',
          created_at: new Date().toISOString(),
          pickup_location: 'Nagpur, Maharashtra, India',
          dropoff_location: 'Bhopal, Madhya Pradesh, India',
          load_status: 'accepted',
        },
      ];

      const updatedLoads = reset ? dummyLoads : [...loads, ...dummyLoads];
      const sorted = updatedLoads.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setLoads(sorted);
      setHasMore(false);
      setPage(pageNum);
    } catch (err: any) {
      console.error('Dummy load fetch failed:', err.message);
      Alert.alert('Error', 'Failed to load dummy data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    if (vehicleId) {
      setRefreshing(true);
      fetchMyLoads(vehicleId, 1, true);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && vehicleId) {
      fetchMyLoads(vehicleId, page + 1);
    }
  };

  const extractCity = (full: string) => full?.split(',')?.[0] || full;

  const filteredLoads = loads.filter(load =>
    selectedTab === 'pending'
      ? load.load_status === 'pending'
      : load.load_status ===
        (userType === 'transporter' ? 'accepted' : 'assigned'),
  );

  if (loading && !vehicleSelectionVisible) {
    return (
      <FlatList
        data={[1, 2, 3, 4, 5]}
        keyExtractor={item => item.toString()}
        renderItem={() => (
          <View style={styles.card}>
            <View
              style={[
                styles.placeholderBox,
                {width: '50%', height: 16, marginBottom: 8},
              ]}
            />
            <View
              style={[
                styles.placeholderBox,
                {width: '80%', height: 12, marginBottom: 10},
              ]}
            />
            <View
              style={[
                styles.placeholderBox,
                {width: '60%', height: 10, marginBottom: 6},
              ]}
            />
            <View style={[styles.placeholderBox, {width: '60%', height: 10}]} />
          </View>
        )}
        contentContainerStyle={{paddingTop: 20}}
      />
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#f9f9f9'}}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>MY LOADS</Text>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedTab === 'pending' && styles.activeFilter,
            ]}
            onPress={() => setSelectedTab('pending')}>
            <Text
              style={[
                styles.filterText,
                selectedTab === 'pending' && styles.activeFilterText,
              ]}>
              PENDING
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              (selectedTab === 'assigned' || selectedTab === 'accepted') &&
                styles.activeFilter,
            ]}
            onPress={() =>
              setSelectedTab(
                userType === 'transporter' ? 'accepted' : 'assigned',
              )
            }>
            <Text
              style={[
                styles.filterText,
                (selectedTab === 'assigned' || selectedTab === 'accepted') &&
                  styles.activeFilterText,
              ]}>
              {userType === 'transporter' ? 'ACCEPTED' : 'ASSIGNED'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredLoads}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('LoadDetailsScreenD', {load: item})
            }>
            <View
              style={[
                styles.badge,
                item.load_status === 'accepted' && {backgroundColor: '#28a745'},
                item.load_status === 'assigned' && {backgroundColor: '#28a745'},
              ]}>
              <Text
                style={[
                  styles.badgeText,
                  item.load_status === 'accepted' && {color: '#fff'},
                  item.load_status === 'assigned' && {color: '#fff'},
                ]}>
                {item.load_status?.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.title}>
              #{item.id} - {item.material_name}
            </Text>
            <Text style={styles.subText}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            <View style={styles.route}>
              <Ionicons name="location" size={14} color="green" />
              <Text style={styles.location}>
                {extractCity(item.pickup_location)}
              </Text>
            </View>
            <View style={styles.route}>
              <Ionicons name="location" size={14} color="red" />
              <Text style={styles.location}>
                {extractCity(item.dropoff_location)}
              </Text>
            </View>

            {selectedTab === 'assigned' && userType === 'driver' && (
              <TouchableOpacity
                style={styles.trackButton}
                onPress={() =>
                  navigation.navigate('TrackLoadScreen', {
                    mode: 'dropoff',
                    pickup_location: {latitude: 19.07, longitude: 72.87},
                    dropoff_location: {latitude: 28.61, longitude: 77.2},
                  })
                }>
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            )}

            {selectedTab === 'accepted' && userType === 'transporter' && (
              <TouchableOpacity
                style={[styles.trackButton, {backgroundColor: '#28a745'}]}
                onPress={() =>
                  navigation.navigate('AssignDriverScreen', {loadId: item.id})
                }>
                <Text style={styles.trackButtonText}>Assign Driver</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No {selectedTab} loads found.</Text>
        }
      />

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
                  onPress={() => handleVehicleSelect(item)}>
                  <Text style={styles.vehicleNumber}>
                    {item.vehicle_number}
                  </Text>
                  <Text style={styles.vehicleMeta}>
                    Type: {item.vehicle_type?.title}
                  </Text>
                  <Text style={styles.vehicleMeta}>
                    Weight: {item.min_weight}kg - {item.max_weight}kg
                  </Text>
                </TouchableOpacity>
              )}
              style={{width: '100%'}}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  title: {fontSize: 16, fontWeight: 'bold', color: '#333'},
  subText: {fontSize: 12, color: '#666', marginBottom: 6},
  route: {flexDirection: 'row', alignItems: 'center', marginVertical: 2},
  location: {marginLeft: 6, fontSize: 14, color: '#444'},
  emptyText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#ffc107',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 1,
  },
  badgeText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholderBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
  },
  trackButton: {
    marginTop: 10,
    paddingVertical: 8,
    backgroundColor: '#007bff',
    borderRadius: 8,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
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
  headerContainer: {
    backgroundColor: '#007bff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
    marginTop: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#ffffff33',
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#007bff',
  },
});

export default MyLoadsScreenD;
