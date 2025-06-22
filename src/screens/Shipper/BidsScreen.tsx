import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';

const BASE_URL = 'https://2maato.com/api';

type Bid = {
  id: number;
  bid_amount: number;
  status: string;
  driver?: {
    name: string;
  };
};

type BidsScreenRouteProp = RouteProp<RootStackParamList, 'BidsScreen'>;

type Props = {
  route: BidsScreenRouteProp;
};

const BidsScreen: React.FC<Props> = ({ route }) => {
  const { loadId } = route.params;
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/load/bids/${loadId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBids(res.data || []);
    } catch (err) {
      console.error('Fetch Bids Error:', err);
      Alert.alert('Error', 'Failed to fetch bids');
    } finally {
      setLoading(false);
    }
  };

  const acceptBid = async (bidId: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/bids/${bidId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      Alert.alert('Success', 'Bid accepted successfully');
      fetchBids(); // Refresh the list
    } catch (err) {
      console.error('Accept Bid Error:', err);
      Alert.alert('Error', 'Failed to accept bid');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (bids.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No bids found for this load.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={bids}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.text}>Bid ID: #{item.id}</Text>
          <Text style={styles.text}>Bid Amount: ₹{item.bid_amount}</Text>
          <Text style={styles.text}>Status: {item.status}</Text>
          <Text style={styles.text}>Driver: {item.driver?.name || 'Unknown'}</Text>

          {item.status === 'pending' && (
            <TouchableOpacity style={styles.button} onPress={() => acceptBid(item.id)}>
              <Text style={styles.buttonText}>Accept Bid</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 10,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#28a745',
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default BidsScreen;
