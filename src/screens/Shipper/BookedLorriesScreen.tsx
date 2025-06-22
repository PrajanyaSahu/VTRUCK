import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const BookedLorriesScreen: React.FC = () => {
  const [bookedLorries, setBookedLorries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'Pending' | 'Completed'>('Pending');

  useEffect(() => {
    const fetchBookedLorries = async () => {
      try {
        setTimeout(() => {
          setBookedLorries([
            {
              id: '1',
              type: 'Small Van',
              vehicleNumber: 'GJ05LE1333',
              location:
                '315, Ambika Pinacle, nr. Lajamni Chowk, Surat, Gujarat',
              weight: '5 Tonnes',
              routes: 22,
              rcVerified: true,
              driver: 'Aditya Kane',
              phone: '7999521467',
              status: 'Pending',
            },
            {
              id: '2',
              type: 'Pickup Truck',
              vehicleNumber: 'GJ05SG3434',
              location: '1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA',
              weight: '10 Tonnes',
              routes: 8,
              rcVerified: true,
              driver: 'Tanmay Tiwari',
              phone: '8982273744',
              status: 'Completed',
            },
            {
              id: '3',
              type: 'Container Truck',
              vehicleNumber: 'GJ05DSD050',
              location: '310, Ambika Pinacle, Surat, Gujarat',
              weight: '6 Tonnes',
              routes: 15,
              rcVerified: true,
              driver: 'Varun Sharma',
              phone: '9300707002',
              status: 'Pending',
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchBookedLorries();
  }, []);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const renderItem = ({item}: {item: any}) => (
    <View style={styles.card}>
      <Text style={styles.vehicleType}>{item.type}</Text>
      <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.infoText}>{item.weight}</Text>
        <Text style={styles.infoText}>{item.routes} Routes</Text>
        {item.rcVerified && (
          <Text style={styles.verifiedText}>
            <Icon name="checkmark-circle" size={14} color="green" /> RC Verified
          </Text>
        )}
      </View>
      <View style={styles.bottomRow}>
        <View style={styles.driverSection}>
          <Icon name="person-circle-outline" size={30} color="#007bff" />
          <View style={{marginLeft: 6}}>
            <Text style={styles.driverName}>{item.driver}</Text>
            <Text style={styles.phoneText}>{item.phone}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => handleCall(item.phone)}>
          <Icon name="call" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredLorries = bookedLorries.filter(item => item.status === filter);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>BOOKED LORRIES</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'Pending' && styles.activeFilter,
            ]}
            onPress={() => setFilter('Pending')}>
            <Text
              style={[
                styles.filterText,
                filter === 'Pending' && styles.activeFilterText,
              ]}>
              PENDING
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'Completed' && styles.activeFilter,
            ]}
            onPress={() => setFilter('Completed')}>
            <Text
              style={[
                styles.filterText,
                filter === 'Completed' && styles.activeFilterText,
              ]}>
              COMPLETED
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <FlatList
          data={filteredLorries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}

      {/* REMOVE THIS PART WHEN GOT API */}
      <View style={{alignItems: 'center', marginBottom: 10}}>
        <Text style={{fontSize: 16, color: '#666'}}>
          This is PlaceHolder Screen
        </Text>
      </View>
      {/* TILL HERE */}
    </View>
  );
};

export default BookedLorriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
  },
  headerContainer: {
    backgroundColor: '#007bff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 20,
    marginBottom: 16,
  },
  screenTitle: {
    paddingVertical: 20,
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
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
    fontWeight: 'bold',
  },

  list: {
    padding: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    elevation: 4,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vehicleNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    marginRight: 10,
    color: '#444',
  },
  verifiedText: {
    fontSize: 13,
    color: 'green',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  phoneText: {
    fontSize: 13,
    color: '#333',
  },
  callButton: {
    backgroundColor: '#007bff',
    borderRadius: 50,
    padding: 10,
  },
});
