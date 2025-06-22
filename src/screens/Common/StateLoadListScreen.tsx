import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import BidModal from '../Common/BidModal';

const dummyLoads = [
  {
    id: '1',
    item_name: 'Steel Pipes',
    from_location: 'Ahmedabad, Gujarat',
    to_location: 'Delhi',
    price: 15000,
  },
  {
    id: '2',
    item_name: 'Fertilizer Bags',
    from_location: 'Indore, MP',
    to_location: 'Lucknow, UP',
    price: 12000,
  },
  {
    id: '3',
    item_name: 'Textiles',
    from_location: 'Surat, Gujarat',
    to_location: 'Chennai, TN',
    price: 18000,
  },
];

const StateLoadListScreen = ({ route }: any) => {
  const { state } = route.params;
  const navigation = useNavigation();

  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<any>(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerText}>{state} LOADS</Text>
        </View>
      </View>

      {/* Load List */}
      <FlatList
        contentContainerStyle={{ padding: 12 }}
        data={dummyLoads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.item_name}</Text>
            <Text style={styles.subText}>From: {item.from_location}</Text>
            <Text style={styles.subText}>To: {item.to_location}</Text>
            <Text style={styles.price}>Expected Price: ₹{item.price}</Text>
            <TouchableOpacity
              style={styles.bidBtn}
              onPress={() => {
                setSelectedLoad(item);
                setBidModalVisible(true);
              }}>
              <Text style={styles.bidBtnText}>Place Bid</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Bid Modal */}
      {BidModal && (
        <BidModal
          visible={bidModalVisible}
          onClose={() => setBidModalVisible(false)}
          onSubmit={(action, offerAmount) => {
            if (action === 'accept') {
              Alert.alert('Accepted', 'Load accepted');
              setBidModalVisible(false);
            } else if (action === 'offer' && offerAmount) {
              Alert.alert('Bid Placed', `You offered ₹${offerAmount} for ${selectedLoad?.item_name}`);
              setBidModalVisible(false);
            }
          }}
        />
      )}
    </View>
  );
};

export default StateLoadListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    elevation: 4,
    height:100,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 24,
  },
  headerText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  card: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  subText: {
    color: '#444',
    fontSize: 13,
    marginTop: 4,
  },
  price: {
    marginTop: 6,
    fontWeight: 'bold',
    color: '#000',
  },
  bidBtn: {
    marginTop: 10,
    backgroundColor: '#28a745',
    paddingVertical: 8,
    borderRadius: 6,
  },
  bidBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
