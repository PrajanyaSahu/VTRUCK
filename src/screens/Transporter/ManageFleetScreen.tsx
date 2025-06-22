import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';

const ManageFleetScreen = () => {
  const [activeTab, setActiveTab] = useState<'drivers' | 'vehicles'>('drivers');

  const dummyDrivers = [
    {id: '1', name: 'Ravi Kumar', phone: '9876543210'},
    {id: '2', name: 'Amit Singh', phone: '9988776655'},
    {id: '3', name: 'Suresh Yadav', phone: '9090909090'},
  ];

  const dummyVehicles = [
    {id: '1', name: 'Tata Ace', number: 'MH12AB1234'},
    {id: '2', name: 'Mahindra Bolero Pickup', number: 'MH14CD5678'},
    {id: '3', name: 'Ashok Leyland Dost', number: 'MH13EF9012'},
  ];

  return (
    <View style={{flex: 1}}>
      <View style={styles.headerContainer}>
        <Text style={styles.screenTitle}>FLEET</Text>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('drivers')}
            style={[
              styles.filterButton,
              activeTab === 'drivers' && styles.activeFilter,
            ]}>
            <Text
              style={[
                styles.filterText,
                activeTab === 'drivers' && styles.activeFilterText,
              ]}>
              DRIVERS
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('vehicles')}
            style={[
              styles.filterButton,
              activeTab === 'vehicles' && styles.activeFilter,
            ]}>
            <Text
              style={[
                styles.filterText,
                activeTab === 'vehicles' && styles.activeFilterText,
              ]}>
              VEHICLES
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.contentContainer}>
        {activeTab === 'drivers' ? (
          <FlatList
            data={dummyDrivers}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.driverCard}>
                <Text style={styles.driverName}>{item.name}</Text>
                <Text style={styles.driverPhone}>{item.phone}</Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={dummyVehicles}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.vehicleCard}>
                <Text style={styles.vehicleName}>{item.name}</Text>
                <Text style={styles.vehicleNumber}>{item.number}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  driverCard: {
    backgroundColor: '#e6f2ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  driverPhone: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  vehicleCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  vehicleNumber: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});

export default ManageFleetScreen;
