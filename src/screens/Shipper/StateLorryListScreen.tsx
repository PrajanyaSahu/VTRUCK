import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';

type NavigationProp = StackNavigationProp<RootStackParamList, 'BookLorry'>;

const dummyLorries = [
  {
    id: '1',
    name: 'Sharma Logistics',
    driver: 'Rajesh Singh',
    vehicleNo: 'MH12AB1234',
    type: '14-Wheeler',
    capacity: '22 Tons',
    location: 'Nagpur, Maharashtra',
  },
  {
    id: '2',
    name: 'Kumar Transport Co.',
    driver: 'Amit Kumar',
    vehicleNo: 'DL05CD7890',
    type: '10-Wheeler',
    capacity: '18 Tons',
    location: 'Kanpur, Uttar Pradesh',
  },
  {
    id: '3',
    name: 'Patel Carriers',
    driver: 'Suresh Patel',
    vehicleNo: 'GJ01EF4567',
    type: '6-Wheeler',
    capacity: '12 Tons',
    location: 'Surat, Gujarat',
  },
];

const StateLorryListScreen = ({route}: any) => {
  const {t} = useTranslation();
  const {state, fromLocation, toLocation} = route.params;
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('lorries_in')} {state?.toUpperCase()}</Text>
      </View>

      <FlatList
        data={dummyLorries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{paddingVertical: 10}}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.left}>
              <Ionicons name="person-circle" size={50} color="#007BFF" />
            </View>
            <View style={styles.middle}>
              <Text style={styles.company}>{item.name}</Text>
              <Text style={styles.details}>
                {item.capacity} • {item.type}
              </Text>
              <Text style={styles.details}>Driver: {item.driver}</Text>
              <Text style={styles.details}>Location: {item.location}</Text>
            </View>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() =>
                navigation.navigate('BookLorry', {
                  lorry: item,
                  from: {description: fromLocation},
                  to: {description: toLocation},
                })
              }>
              <Text style={styles.bookBtnText}>Book Now</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default StateLorryListScreen;

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
    paddingHorizontal: 12,
    borderBottomRightRadius:20,
    borderBottomLeftRadius:20,
    height:100,
  },
  backBtn: {
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  left: {
    marginRight: 10,
  },
  middle: {
    flex: 1,
  },
  company: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  details: {
    fontSize: 13,
    color: '#444',
    marginTop: 2,
  },
  bookBtn: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  bookBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
