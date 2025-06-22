import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';

const BASE_URL = 'https://2maato.com/api';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface Bid {
  id: number;
  bid_amount: string;
  status: string;
  user: {
    name: string;
  };
  vehicle: {
    vehicle_number: string;
  };
}

interface Load {
  id: number;
  pickup_location: string;
  dropoff_location: string;
  material_name: string;
  weight: string;
  amount: number;
  load_status: string;
  created_at: string;
  pick_lat: number;
  pick_lng: number;
  drop_lat: number;
  drop_lng: number;
  bids?: Bid[];
  accepted_bid?: {
    driver_name: string;
    bid_amount: string;
  } | null;
}

const MyLoadsScreenS = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'assigned'>(
    'pending',
  );
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    fetchLoads();
  }, [statusFilter]);

  const fetchBidsForLoad = async (loadId: number, token: string) => {
    try {
      const res = await axios.get(`${BASE_URL}/load/bids/${loadId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bids: Bid[] = res.data || [];
      const accepted = bids.find(bid => bid.status === 'accepted');

      return {
        bids,
        accepted_bid: accepted
          ? {
              driver_name: accepted.user?.name ?? 'Driver',
              bid_amount: accepted.bid_amount,
              vehicle_number: accepted.vehicle?.vehicle_number ?? '',
            }
          : null,
      };
    } catch (err) {
      console.warn(`Failed to fetch bids for load ${loadId}`, err);
      return {bids: [], accepted_bid: null};
    }
  };

  const fetchLoads = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const statusParam = statusFilter;

      const res = await axios.get(
        `${BASE_URL}/my-loads?load_status=${statusParam}&load_type=POST_LOAD`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const baseLoads: Load[] = res.data?.data?.data ?? [];

      const enrichedLoads = await Promise.all(
        baseLoads.map(async load => {
          const bidData = await fetchBidsForLoad(load.id, token!);
          return {...load, ...bidData};
        }),
      );

      setLoads(enrichedLoads);
    } catch (error) {
      console.error('Error fetching loads:', error);
      setLoads([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const getStateFromLocation = (location: string) => {
    const parts = location.split(',');
    const rawState = parts[parts.length - 2]?.trim() || location;
    return rawState.replace(/\d+/g, '').trim();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: '2-digit',
    });
  };

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const renderItem = ({item}: {item: Load}) => {
    const distance = calculateDistance(
      item.pick_lat,
      item.pick_lng,
      item.drop_lat,
      item.drop_lng,
    );

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('LoadDetailsScreenS', {load: item})}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.vehicleType}>{item.material_name}</Text>
            <Text style={styles.rate}>₹{item.amount} /Tonne</Text>
          </View>

          <View style={styles.locationsRow}>
            <View style={styles.locationCol}>
              <Text style={styles.locationState}>
                {getStateFromLocation(item.pickup_location)}
              </Text>
              <Text style={styles.locationLabel}>Load</Text>
            </View>

            <View style={styles.routeMiddle}>
              <Text style={styles.routeLine}>─── 🚚 ───</Text>
              <Text style={styles.distance}>~{distance} KM</Text>
            </View>

            <View style={styles.locationCol}>
              <Text style={styles.locationState}>
                {getStateFromLocation(item.dropoff_location)}
              </Text>
              <Text style={styles.locationLabel}>Unload</Text>
            </View>
          </View>

          {/* Accepted/Bid Info at Bottom */}
          {item.accepted_bid ? (
            <View style={styles.acceptedBox}>
              <Text style={styles.acceptedText}>
                Accepted by{' '}
                <Text style={{fontWeight: 'bold'}}>
                  {item.accepted_bid.driver_name}
                </Text>{' '}
              </Text>
            </View>
          ) : item.bids?.length ? (
            <Text style={styles.bidCountText}>
              {item.bids.length} bid{item.bids.length > 1 ? 's' : ''} received
            </Text>
          ) : (
            <Text style={styles.noBidsText}>No bids yet</Text>
          )}

          <View style={styles.footerRow}>
            <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
            <Text style={styles.statusText}>
              {capitalize(item.load_status)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>MY LOADS</Text>
        <View style={styles.tabContainer}>
          {['pending', 'assigned'].map(status => {
            const isActive = statusFilter === status;
            const label = status === 'assigned' ? 'ONGOING' : 'PENDING';
            return (
              <TouchableOpacity
                key={status}
                onPress={() => setStatusFilter(status as any)}
                style={[styles.tab, isActive && styles.activeTab]}>
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : loads.length === 0 ? (
        <Text style={styles.noData}>No loads found.</Text>
      ) : (
        <FlatList
          data={loads}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
};

export default MyLoadsScreenS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    padding: 25,
    textAlign: 'center',
    color: '#fff',
  },
  headerContainer: {
    backgroundColor: '#007bff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
tabContainer: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 50,
  marginBottom: 10,
},
tab: {
  paddingHorizontal: 20,
  paddingVertical: 8,
  backgroundColor: '#ffffff33',
  borderRadius: 20,
},
activeTab: {
  backgroundColor: '#fff',
},
tabText: {
  fontSize: 14,
  color: '#fff',
  fontWeight: '500',
},
activeTabText: {
  color: '#007bff',
  fontWeight: 'bold',
},
  list: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  locationsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationCol: {
    alignItems: 'center',
    width: 80,
  },
  locationState: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationLabel: {
    backgroundColor: '#eee',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },
  routeMiddle: {
    alignItems: 'center',
  },
  routeLine: {
    fontSize: 14,
    color: '#aaa',
  },
  distance: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  acceptedBox: {
    backgroundColor: '#d1f7c4',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  acceptedText: {
    color: '#155724',
    fontSize: 14,
  },
  bidCountText: {
    color: '#ff9800',
    marginTop: 10,
    fontSize: 14,
  },
  noBidsText: {
    color: '#999',
    marginTop: 10,
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007bff',
  },
});
