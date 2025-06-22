import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
  Linking,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  RouteProp,
} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {RootStackParamList} from '../../navigation/AppNavigator';

type LoadDetailsRouteProp = RouteProp<RootStackParamList, 'LoadDetailsScreenS'>;
type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'LoadDetailsScreenS'
>;

interface Props {
  route: LoadDetailsRouteProp;
}

interface Bid {
  id: number;
  bid_amount: string;
  status: string;
  user: {
    name: string;
    profile_photo_url: string;
    phone_number: string;
  };
  vehicle: {
    vehicle_number: string;
  };
}

const BASE_URL = 'https://2maato.com/api';

const LoadDetailsScreenS: React.FC<Props> = ({route}) => {
  const navigation = useNavigation<NavigationProp>();
  const {load} = route.params;
  const [fullLoad, setFullLoad] = useState<any>(load);
  const [bids, setBids] = useState<Bid[]>([]);
  const [acceptedBid, setAcceptedBid] = useState<Bid | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLoadDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const res = await axios.get(`${BASE_URL}/load/${load.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFullLoad(res.data.load);
    } catch (error) {
      console.error('Failed to fetch load details:', error);
    }
  };

  const fetchBids = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const res = await axios.get(`${BASE_URL}/load/bids/${load.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allBids: Bid[] = res.data;
      const accepted = allBids.find(
        bid => bid.status.toLowerCase() === 'accepted',
      );

      if (accepted) {
        setAcceptedBid(accepted);
      } else {
        setBids(allBids);
      }
    } catch (error) {
      console.error('Failed to fetch bids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoadDetails();
    fetchBids();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('ShipperTabs', {screen: 'MyLoads'});
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [navigation]),
  );

  const getStateFromLocation = (location: string | undefined): string => {
    if (!location) return 'Unknown';
    const parts = location.split(',');
    const rawState = parts[parts.length - 2]?.trim() || location;
    return rawState.replace(/\d+/g, '').trim();
  };

  const getCityFromLocation = (location: string | undefined): string => {
    if (!location) return 'Unknown';
    const parts = location.split(',');
    const rawCity = parts[parts.length - 3]?.trim() || location;
    return rawCity.replace(/\d+/g, '').trim();
  };
  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleAcceptBid = async (bidId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      await axios.post(`${BASE_URL}/bids/${bidId}/accept`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Alert.alert('Bid accepted successfully!');
      fetchBids();
    } catch (error) {
      console.error('Failed to accept bid:', error);
      Alert.alert('Failed to accept bid. Please try again.');
    }
  };

  const renderBid = ({item}: {item: Bid}) => (
    <View style={styles.bidCard}>
      <View style={styles.bidHeader}>
        <Image
          source={{uri: item.user.profile_photo_url}}
          style={styles.avatar}
        />
        <View style={{flex: 1, marginLeft: 10}}>
          <Text style={styles.bidName}>{item.user.name}</Text>
          <Text style={styles.bidRate}>₹{item.bid_amount} / Fixed</Text>
          <Text style={styles.bidVehicle}>
            Vehicle: {item.vehicle.vehicle_number}
          </Text>
        </View>
        <Text style={styles.bidStatus}>{item.status}</Text>
      </View>

      <View style={styles.bidButtons}>
        <TouchableOpacity style={styles.rejectBtn}>
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => handleAcceptBid(item.id)}>
          <Text style={styles.acceptText}>Accept & Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.containerTitle}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{padding: 15}}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={{flex: 1, alignItems: 'center', marginRight: 32}}>
          <Text style={styles.title}>LOAD #{fullLoad.id}</Text>
        </View>
      </View>

      <View style={styles.loadCard}>
        <View style={styles.loadTop}>
          <View>
            <Text style={styles.materialText}>{fullLoad.material_name}</Text>
            <Text style={styles.rate}>₹{fullLoad.amount}/Tonne</Text>
          </View>
          <Text style={styles.dateText}>
            {fullLoad.created_at
              ? new Date(fullLoad.created_at).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A'}
          </Text>
        </View>

        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <Text style={styles.dotGreen}>●</Text>
            <View>
              <Text style={styles.locationText}>
                {getCityFromLocation(fullLoad.pickup_location)}
              </Text>
              <Text style={styles.stateText}>
                {getStateFromLocation(fullLoad.pickup_location)}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Text style={styles.dotRed}>●</Text>
            <View>
              <Text style={styles.locationText}>
                {getCityFromLocation(fullLoad.dropoff_location)}
              </Text>
              <Text style={styles.stateText}>
                {getStateFromLocation(fullLoad.dropoff_location)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>Tonnes: {fullLoad.weight}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#3253ff" />
      ) : acceptedBid ? (
        <View style={{paddingHorizontal: 16, paddingTop: 10}}>
          <View style={[styles.bidCard, styles.acceptedCard]}>
            <View style={styles.bidHeader}>
              <Image
                source={{uri: acceptedBid.user.profile_photo_url}}
                style={styles.avatar}
              />
              <View style={{flex: 1, marginLeft: 10}}>
                <Text style={styles.bidName}>
                  {fullLoad.assigned_driver.name}
                </Text>
                <Text style={styles.bidVehicle}>
                  Vehicle: {acceptedBid.vehicle.vehicle_number}
                </Text>
                <Text style={styles.bidPhone}>
                  Phone: {fullLoad.assigned_driver.phone}
                </Text>
              </View>
              <View style={{alignItems: 'center'}}>
                <Text style={styles.bidStatus}>Accepted</Text>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(fullLoad.assigned_driver.phone)}>
                  <Ionicons name="call" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      ) : bids.length > 0 ? (
        <FlatList
          data={bids}
          keyExtractor={item => item.id.toString()}
          renderItem={renderBid}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noBidsText}>No bids placed on this load yet.</Text>
      )}
    </ScrollView>
  );
};

export default LoadDetailsScreenS;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9ff',
  },
  backIcon: {
    marginBottom: 12,
  },
  callBtn: {
    marginTop: 6,
    backgroundColor: '#28a745',
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    marginTop: 5,
    marginBottom: 12,
    alignSelf: 'center',
    color: '#fff',
  },
  containerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 100,
    backgroundColor: '#007bff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  loadCard: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    marginHorizontal: 16,
    elevation: 3,
  },
  loadTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  materialText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  rate: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  locationSection: {
    marginTop: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dotGreen: {
    fontSize: 16,
    color: 'green',
    marginRight: 6,
  },
  dotRed: {
    fontSize: 16,
    color: 'red',
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#000',
  },
  stateText: {
    fontSize: 13,
    color: '#666',
  },
  detailsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  detailText: {
    fontSize: 13,
    color: '#555',
  },
  bidCard: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  acceptedCard: {
    backgroundColor: '#e6f9e6',
    borderColor: 'green',
    borderWidth: 1,
  },
  bidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#ddd',
  },
  bidName: {
    fontSize: 16,
    fontWeight: '600',
  },
  bidRate: {
    fontSize: 12,
    color: '#555',
  },
  bidVehicle: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  bidStatus: {
    fontSize: 13,
    color: '#444',
    fontWeight: '600',
  },
  bidButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectBtn: {
    backgroundColor: '#fce2e2',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
  },
  rejectText: {
    textAlign: 'center',
    color: '#d00000',
    fontWeight: '600',
  },
  acceptBtn: {
    backgroundColor: '#3253ff',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 6,
  },
  acceptText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  noBidsText: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
  },
  bidPhone: {
    fontSize: 12,
    color: '#444',
    marginTop: 4,
  },
});
