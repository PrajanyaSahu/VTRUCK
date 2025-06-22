import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Driver = {
  id: number;
  name: string;
  phone: string;
};

const AssignDriverScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { loadId } = route.params;

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setDrivers([
        { id: 1, name: 'Ravi Kumar', phone: '9876543210' },
        { id: 2, name: 'Amit Sharma', phone: '8765432109' },
        { id: 3, name: 'Sunil Verma', phone: '9988776655' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const assignDriver = (driverId: number) => {
    Alert.alert(
      'Driver Assigned',
      `Driver ID ${driverId} has been assigned to Load #${loadId}.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007bff" />
        </TouchableOpacity>
        <Text style={styles.header}>SELECT A DRIVER</Text>
      </View>

      <FlatList
        data={drivers}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => assignDriver(item.id)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.phone}>+91 {item.phone}</Text>
            <Text style={styles.assign}>Assign</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#777', marginTop: 20 }}>
            No drivers found
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2', paddingTop: 20 },

  headerContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007bff',
  },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  phone: { fontSize: 14, color: '#666', marginVertical: 4 },
  assign: {
    marginTop: 8,
    backgroundColor: '#28a745',
    paddingVertical: 6,
    textAlign: 'center',
    color: '#fff',
    borderRadius: 6,
    fontWeight: 'bold',
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AssignDriverScreen;
