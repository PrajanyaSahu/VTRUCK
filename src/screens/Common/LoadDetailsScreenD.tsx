import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';

type LoadDetailsScreenRouteProp = RouteProp<
  RootStackParamList,
  'LoadDetailsScreenD'
>;

const LoadDetailsScreenD = () => {
  const route = useRoute<LoadDetailsScreenRouteProp>();
  const navigation = useNavigation();
  const {load} = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LOAD #{load.id}</Text>
        <View style={{width: 24}} />
      </View>

      {/* Load Info */}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>Material:</Text>
          <Text style={styles.value}>{load.material_name}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.status}>{load.load_status.toUpperCase()}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Created At:</Text>
          <Text style={styles.value}>
            {new Date(load.created_at).toLocaleString()}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color="green" />
          <Text style={styles.locationText}>
            Pickup: {load.pickup_location}
          </Text>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location" size={18} color="red" />
          <Text style={styles.locationText}>
            Dropoff: {load.dropoff_location}
          </Text>
        </View>
        {/* DELETE THIS  */}
        <View style={{alignItems: 'center', marginBottom: 10, marginTop:250}}>
          <Text style={{fontSize: 16, color: '#666'}}>
            This is PlaceHolder Screen
          </Text>
        </View>
        {/* TILL HERE */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
    backgroundColor: '#007bff'
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  row: {
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#222',
  },
  status: {
    fontSize: 16,
    color: '#e67e22',
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#444',
  },
});

export default LoadDetailsScreenD;
