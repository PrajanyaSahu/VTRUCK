import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import type {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://2maato.com/api';

type NavigationProp = StackNavigationProp<RootStackParamList, 'DriverHome'>;

type User = {
  name: string;
  kyc_status: 'pending' | 'verified' | 'rejected' | null;
};

const StateCard = ({state, load, image, onPress}: any) => (
  <TouchableOpacity
    style={{
      width: '30%',
      margin: 6,
      borderRadius: 10,
      backgroundColor: '#fff',
      alignItems: 'center',
      padding: 8,
      elevation: 2,
    }}
    onPress={onPress}>
    <Image
      source={image}
      style={{height: 50, width: 60, marginBottom: 4}}
      resizeMode="contain"
    />
    <Text
      style={{fontWeight: 'bold', fontSize: 14, textAlign: 'center'}}
      numberOfLines={2}>
      {state}
    </Text>
    <Text style={{fontSize: 12, color: '#555'}}>🌐 {load} Load</Text>
  </TouchableOpacity>
);

const DriverHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Not logged in');
        navigation.replace('Login');
        return;
      }

      const response = await axios.get(`${BASE_URL}/me`, {
        headers: {Authorization: `Bearer ${token}`},
      });

      const res = response.data;
      const fetchedUser = {
        name: res.user?.name || 'N/A',
        kyc_status: res.kyc_status || null,
      };
      setUser(fetchedUser);

      if (!fetchedUser.kyc_status || fetchedUser.kyc_status === 'rejected') {
        setShowKYCModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      Alert.alert('Error', 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleKYCConfirm = () => {
    if (user?.kyc_status === 'rejected' || user?.kyc_status === null) {
      setShowKYCModal(false);
      navigation.navigate({name: 'KYC', params: undefined});
    } else {
      Alert.alert('Info', 'Your KYC is already submitted or verified.');
      setShowKYCModal(false);
    }
  };

  const handleKYCDecline = () => setShowKYCModal(false);

  const getKYCLabel = () => {
    switch (user?.kyc_status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending';
      default:
        return 'Unverified';
    }
  };

  const getKYCIcon = () => {
    if (user?.kyc_status === 'verified')
      return (
        <MaterialCommunityIcons name="check-decagram" size={16} color="green" />
      );
    if (user?.kyc_status === 'pending')
      return (
        <MaterialCommunityIcons
          name="progress-clock"
          size={16}
          color="#ff9800"
        />
      );
    return (
      <MaterialCommunityIcons
        name="alert-circle-outline"
        size={16}
        color="red"
      />
    );
  };

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }
  const operatingRoutes = [
    {
      state: 'Andhra Pradesh',
      load: 7,
      image: require('../../../assets/states/AndhraPradesh.png'),
    },
    {
      state: 'Arunachal Pradesh',
      load: 0,
      image: require('../../../assets/states/ArunachalPradesh.png'),
    },
    {
      state: 'Assam',
      load: 1,
      image: require('../../../assets/states/Assam.png'),
    },
    {
      state: 'Bihar',
      load: 11,
      image: require('../../../assets/states/Bihar.png'),
    },
    {
      state: 'Chhattisgarh',
      load: 0,
      image: require('../../../assets/states/Chhattisgarh.png'),
    },
    {
      state: 'Delhi',
      load: 0,
      image: require('../../../assets/states/Delhi.png'),
    },
    {state: 'Goa', load: 0, image: require('../../../assets/states/Goa.png')},
    {
      state: 'Gujarat',
      load: 142,
      image: require('../../../assets/states/Gujrat.png'),
    },
    {
      state: 'Haryana',
      load: 4,
      image: require('../../../assets/states/Haryana.png'),
    },
    {
      state: 'Himachal Pradesh',
      load: 0,
      image: require('../../../assets/states/HimachalPradesh.png'),
    },
    {
      state: 'Jammu and Kashmir',
      load: 0,
      image: require('../../../assets/states/Jammuandkashmir.png'),
    },
    {
      state: 'Jharkhand',
      load: 0,
      image: require('../../../assets/states/Jharkhand.png'),
    },
    {
      state: 'Karnataka',
      load: 10,
      image: require('../../../assets/states/karnataka.png'),
    },
    {
      state: 'Kerala',
      load: 0,
      image: require('../../../assets/states/Kerala.png'),
    },
    {
      state: 'Madhya Pradesh',
      load: 11,
      image: require('../../../assets/states/MadhyaPradesh.png'),
    },
    {
      state: 'Maharashtra',
      load: 65,
      image: require('../../../assets/states/Maharashtra.png'),
    },
    {
      state: 'Manipur',
      load: 0,
      image: require('../../../assets/states/Manipur.png'),
    },
    {
      state: 'Meghalaya',
      load: 0,
      image: require('../../../assets/states/meghalay.png'),
    },
    {
      state: 'Mizoram',
      load: 0,
      image: require('../../../assets/states/Mizoram.png'),
    },
    {
      state: 'Odisha',
      load: 0,
      image: require('../../../assets/states/Odisha.png'),
    },
    {
      state: 'Punjab',
      load: 15,
      image: require('../../../assets/states/Punjab.png'),
    },
    {
      state: 'Rajasthan',
      load: 5,
      image: require('../../../assets/states/Rajasthan.png'),
    },
    {
      state: 'Sikkim',
      load: 0,
      image: require('../../../assets/states/Sikkim.png'),
    },
    {
      state: 'Tamil Nadu',
      load: 15,
      image: require('../../../assets/states/TamilNadu.png'),
    },
    {
      state: 'Telangana',
      load: 0,
      image: require('../../../assets/states/Telangana.png'),
    },
    {
      state: 'Tripura',
      load: 0,
      image: require('../../../assets/states/Tripura.png'),
    },
    {
      state: 'Uttar Pradesh',
      load: 14,
      image: require('../../../assets/states/UttarPradesh.png'),
    },
    {
      state: 'Uttarakhand',
      load: 0,
      image: require('../../../assets/states/Uttarakhand.png'),
    },
    {
      state: 'West Bengal',
      load: 0,
      image: require('../../../assets/states/WestBengal.png'),
    },
    {
      state: 'Nagaland',
      load: 0,
      image: require('../../../assets/states/Nagaland.png'),
    },
  ];

  return (
    <>
      <Modal visible={showKYCModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Complete Your KYC</Text>
            <Text style={styles.modalMessage}>
              To get verified and start accepting loads, please complete your
              KYC.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={handleKYCConfirm}>
                <Text style={styles.modalBtnTextPrimary}>Proceed</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={handleKYCDecline}>
                <Text style={styles.modalBtnTextSecondary}>Maybe Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar} />
            <View>
              <Text style={styles.name}>{user.name}</Text>
              <View style={styles.verification}>
                {getKYCIcon()}
                <Text style={styles.kycBadge}>{getKYCLabel()}</Text>
              </View>
            </View>
          </View>

          <View style={styles.grid}>
            <TouchableOpacity
              style={styles.gridBtn}
              onPress={() =>
                navigation.navigate({name: 'FindLoad', params: undefined})
              }>
              <Ionicons
                name="search"
                size={18}
                color="#007BFF"
                style={styles.gridIcon}
              />
              <Text style={styles.gridBtnText}>Find Loads</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridBtn}
              onPress={() =>
                navigation.navigate({name: 'NearbyLoads', params: undefined})
              }>
              <MaterialIcons
                name="location-on"
                size={18}
                color="#007BFF"
                style={styles.gridIcon}
              />
              <Text style={styles.gridBtnText}>Nearby Loads</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridBtn}
              onPress={() =>
                navigation.navigate({
                  name: 'AddVehicle',
                  params: {
                    formData: {},
                    selectedRoutes: [],
                    vehicle: undefined,
                  },
                })
              }>
              <MaterialIcons
                name="local-shipping"
                size={18}
                color="#007BFF"
                style={styles.gridIcon}
              />
              <Text style={styles.gridBtnText}>Add Vehicle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridBtn}
              onPress={() =>
                navigation.navigate({name: 'ManageVehicles', params: undefined})
              }>
              <MaterialCommunityIcons
                name="truck-check"
                size={18}
                color="#007BFF"
                style={styles.gridIcon}
              />
              <Text style={styles.gridBtnText}>Manage Vehicle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyBox}>
          <Image
            source={require('../../../assets/Truck.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
          <Text style={styles.emptyText}>
            NO LOADS HAVE BEEN ACCEPTED SO FAR
          </Text>
        </View>
        <View style={styles.routeContainer}>
          <Text style={styles.routeTitle}>Operating Routes</Text>
          <View style={styles.routeGrid}>
            {operatingRoutes.map((route, index) => (
              <StateCard
                key={index}
                state={route.state}
                load={route.load}
                image={route.image}
                onPress={() =>
                  navigation.navigate('StateLoadList', {state: route.state})
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default DriverHomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FE',
  },
  header: {
    backgroundColor: '#007BFF',
    paddingTop: 32,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#ddd',
    marginRight: 15,
  },
  name: {
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
  verification: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  kycBadge: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyBox: {
    alignItems: 'center',
    marginTop: 30,
  },
  illustration: {
    width: 280,
    height: 180,
  },
  emptyText: {
    color: '#007BFF',
    fontWeight: 'bold',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#555',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtnPrimary: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  modalBtnTextPrimary: {
    color: '#fff',
    textAlign: 'center',
  },
  modalBtnSecondary: {
    borderWidth: 1,
    borderColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  modalBtnTextSecondary: {
    color: '#007BFF',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 12,
    rowGap: 14,
  },
  gridBtn: {
    width: '47%',
    backgroundColor: '#fff',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  gridIcon: {
    marginRight: 10,
  },
  gridBtnText: {
    color: '#007BFF',
    fontWeight: '600',
    fontSize: 15,
  },
  routeContainer: {
    marginTop: 20,
    paddingHorizontal: 12,
  },
  routeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
    color: '#333',
  },
  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});
