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
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {RootStackParamList} from '../../navigation/AppNavigator';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'https://2maato.com/api';

type ShipperNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ShipperTabs'
>;

type User = {
  name: string;
  kyc_status: 'pending' | 'verified' | 'rejected' | null;
};

const StateCard = ({state, lorry, image, onPress}: any) => (
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
    <Text style={{fontSize: 12, color: '#555'}}>🚚 {lorry} Lorry</Text>
  </TouchableOpacity>
);

const ShipperHomeScreen = () => {
  const navigation = useNavigation<ShipperNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKYCModal, setShowKYCModal] = useState(false);
  const { t } = useTranslation();
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
    setShowKYCModal(false);
    navigation.navigate('KYC');
  };

  const handleKYCDecline = () => setShowKYCModal(false);

const getKYCLabel = () => {
  switch (user?.kyc_status) {
    case 'verified':
      return t('verified');
    case 'pending':
      return t('pending');
    default:
      return t('unverified');
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
      state: t('states.andhra_pradesh'),
      lorry: 7,
      image: require('../../../assets/states/AndhraPradesh.png'),
    },
    {
      state: t('states.arunachal_pradesh'),
      lorry: 0,
      image: require('../../../assets/states/ArunachalPradesh.png'),
    },
    {
      state: t('states.assam'),
      lorry: 1,
      image: require('../../../assets/states/Assam.png'),
    },
    {
      state: t('states.bihar'),
      lorry: 11,
      image: require('../../../assets/states/Bihar.png'),
    },
    {
      state: t('states.chhattisgarh'),
      lorry: 0,
      image: require('../../../assets/states/Chhattisgarh.png'),
    },
    {
      state: t('states.delhi'),
      lorry: 0,
      image: require('../../../assets/states/Delhi.png'),
    },
    {
      state: t('states.goa'),
      lorry: 0,
      image: require('../../../assets/states/Goa.png'),
    },
    {
      state: t('states.gujarat'),
      lorry: 142,
      image: require('../../../assets/states/Gujrat.png'),
    },
    {
      state: t('states.haryana'),
      lorry: 4,
      image: require('../../../assets/states/Haryana.png'),
    },
    {
      state: t('states.himachal_pradesh'),
      lorry: 0,
      image: require('../../../assets/states/HimachalPradesh.png'),
    },
    {
      state: t('states.jammu_and_kashmir'),
      lorry: 0,
      image: require('../../../assets/states/Jammuandkashmir.png'),
    },
    {
      state: t('states.jharkhand'),
      lorry: 0,
      image: require('../../../assets/states/Jharkhand.png'),
    },
    {
      state: t('states.karnataka'),
      lorry: 10,
      image: require('../../../assets/states/karnataka.png'),
    },
    {
      state: t('states.kerala'),
      lorry: 0,
      image: require('../../../assets/states/Kerala.png'),
    },
    {
      state: t('states.madhya_pradesh'),
      lorry: 11,
      image: require('../../../assets/states/MadhyaPradesh.png'),
    },
    {
      state: t('states.maharashtra'),
      lorry: 65,
      image: require('../../../assets/states/Maharashtra.png'),
    },
    {
      state: t('states.manipur'),
      lorry: 0,
      image: require('../../../assets/states/Manipur.png'),
    },
    {
      state: t('states.meghalaya'),
      lorry: 0,
      image: require('../../../assets/states/meghalay.png'),
    },
    {
      state: t('states.mizoram'),
      lorry: 0,
      image: require('../../../assets/states/Mizoram.png'),
    },
    {
      state: t('states.odisha'),
      lorry: 0,
      image: require('../../../assets/states/Odisha.png'),
    },
    {
      state: t('states.punjab'),
      lorry: 15,
      image: require('../../../assets/states/Punjab.png'),
    },
    {
      state: t('states.rajasthan'),
      lorry: 5,
      image: require('../../../assets/states/Rajasthan.png'),
    },
    {
      state: t('states.sikkim'),
      lorry: 0,
      image: require('../../../assets/states/Sikkim.png'),
    },
    {
      state: t('states.tamil_nadu'),
      lorry: 15,
      image: require('../../../assets/states/TamilNadu.png'),
    },
    {
      state: t('states.telangana'),
      lorry: 0,
      image: require('../../../assets/states/Telangana.png'),
    },
    {
      state: t('states.tripura'),
      lorry: 0,
      image: require('../../../assets/states/Tripura.png'),
    },
    {
      state: t('states.uttar_pradesh'),
      lorry: 14,
      image: require('../../../assets/states/UttarPradesh.png'),
    },
    {
      state: t('states.uttarakhand'),
      lorry: 0,
      image: require('../../../assets/states/Uttarakhand.png'),
    },
    {
      state: t('states.west_bengal'),
      lorry: 0,
      image: require('../../../assets/states/WestBengal.png'),
    },
    {
      state: t('states.nagaland'),
      lorry: 0,
      image: require('../../../assets/states/Nagaland.png'),
    },
  ];

  return (
    <>
      <Modal visible={showKYCModal} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('complete_kyc_title')}</Text>
            <Text style={styles.modalMessage}>
              {t('complete_kyc_message')}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={handleKYCConfirm}>
                <Text style={styles.modalBtnTextPrimary}>{t('proceed')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                onPress={handleKYCDecline}>
                <Text style={styles.modalBtnTextSecondary}>{t('maybe_later')}</Text>
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
                navigation.navigate('AddLoad', {userType: 'shipper'})
              }>
              <Icon
                name="add-circle-outline"
                size={18}
                color="#007BFF"
                style={styles.gridIcon}
              />
              <Text style={styles.gridBtnText}>{t('post_load')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.gridBtn}
              onPress={() => navigation.navigate('FindLorry')}>
              <Icon
                name="search-outline"
                size={18}
                color="#007BFF"
                style={styles.gridIcon}
              />
              <Text style={styles.gridBtnText}>{t('find_lorry')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.emptyBox}>
          <Image
            source={require('../../../assets/Shipper.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>
        <View style={styles.routesContainer}>
          <Text style={styles.routesTitle}>	{t('operating_routes')}</Text>
          <View style={styles.routesGrid}>
            {operatingRoutes.map((route, index) => (
              <StateCard
                key={index}
                state={route.state}
                lorry={route.lorry}
                image={route.image}
                onPress={() =>
                  navigation.navigate('StateLorryList', {state: route.state})
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default ShipperHomeScreen;

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
  grid: {
    flexDirection: 'row',
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
  routesContainer: {
    paddingHorizontal: 12,
    marginTop: 24,
  },
  routesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft: 4,
    color: '#333',
  },
  routesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
});
