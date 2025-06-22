// AddLoadScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  Switch,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../../navigation/AppNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useFocusEffect} from '@react-navigation/native';
import ContactModal from '../../components/ContactModal';
import {useTranslation} from 'react-i18next';

import axios from 'axios';

const BASE_URL = 'https://2maato.com/api';

type AddLoadScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddLoad'
>;

const AddLoadScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<AddLoadScreenNavigationProp>();
  const userType = route.params?.userType || 'shipper';

  const [step, setStep] = useState(1);
  const {t} = useTranslation();
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [pickupLat, setPickupLat] = useState<number | undefined>();
  const [pickupLng, setPickupLng] = useState<number | undefined>();
  const [dropoffLat, setDropoffLat] = useState<number | undefined>();
  const [dropoffLng, setDropoffLng] = useState<number | undefined>();
  const [pickupStateId, setPickupStateId] = useState<number | undefined>();
  const [dropoffStateId, setDropoffStateId] = useState<number | undefined>();
  const [materialName, setMaterialName] = useState('');
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [fixedPrice, setFixedPrice] = useState(false);
  const [visibleHours, setVisibleHours] = useState('');
  const [limitVisibility, setLimitVisibility] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);
  const [pickupContact, setPickupContact] = useState({name: '', phone: ''});
  const [dropContact, setDropContact] = useState({name: '', phone: ''});
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false);

  const [vehicleOptions, setVehicleOptions] = useState<
    {id: number; title: string; min_weight: number; max_weight: number}[]
  >([]);
  const [errors, setErrors] = useState({
    pickupLocation: false,
    dropoffLocation: false,
    materialName: false,
    weight: false,
    description: false,
    selectedVehicle: false,
  });
  useFocusEffect(
    React.useCallback(() => {
      const params = route.params;

      if (params?.pickupLocation && params?.pickupLat && params?.pickupLng) {
        setPickupLocation(params.pickupLocation);
        setPickupLat(params.pickupLat);
        setPickupLng(params.pickupLng);
        getStateIdFromLatLng(
          params.pickupLat,
          params.pickupLng,
          setPickupStateId,
        );
      }

      if (params?.dropoffLocation && params?.dropoffLat && params?.dropoffLng) {
        setDropoffLocation(params.dropoffLocation);
        setDropoffLat(params.dropoffLat);
        setDropoffLng(params.dropoffLng);
        getStateIdFromLatLng(
          params.dropoffLat,
          params.dropoffLng,
          setDropoffStateId,
        );
      }
    }, [route.params]),
  );
  useEffect(() => {
    if (
      route.params?.pickupLocation &&
      route.params?.pickupLat &&
      route.params?.pickupLng
    ) {
      setPickupLocation(route.params.pickupLocation);
      setPickupLat(route.params.pickupLat);
      setPickupLng(route.params.pickupLng);
      getStateIdFromLatLng(
        route.params.pickupLat,
        route.params.pickupLng,
        setPickupStateId,
      );
    }
    if (
      route.params?.dropoffLocation &&
      route.params?.dropoffLat &&
      route.params?.dropoffLng
    ) {
      setDropoffLocation(route.params.dropoffLocation);
      setDropoffLat(route.params.dropoffLat);
      setDropoffLng(route.params.dropoffLng);
      getStateIdFromLatLng(
        route.params.dropoffLat,
        route.params.dropoffLng,
        setDropoffStateId,
      );
    }
  }, [route.params]);

  const getStateIdFromLatLng = async (
    lat: number,
    lng: number,
    setStateId: React.Dispatch<React.SetStateAction<number | undefined>>,
  ) => {
    try {
      const geoRes = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyBtHbi7VedBLnRVP9ph10ziegxlgfue-ZQ`,
      );
      const stateComponent = geoRes.data.results
        .flatMap((r: any) => r.address_components)
        .find((comp: any) =>
          comp.types.includes('administrative_area_level_1'),
        );
      const stateName = stateComponent?.long_name;
      if (!stateName) return;

      const countriesRes = await axios.get(`${BASE_URL}/countries`, {
        auth: {username: 'vtruck', password: 'secret@123'},
      });

      const countryId = countriesRes.data?.[0]?.id;
      if (!countryId) return;

      const statesRes = await axios.get(
        `${BASE_URL}/states/by-country/${countryId}`,
        {
          auth: {username: 'vtruck', password: 'secret@123'},
        },
      );

      const match = statesRes.data.find(
        (s: any) =>
          s.title &&
          stateName &&
          s.title.toLowerCase() === stateName.toLowerCase(),
      );
      if (match) setStateId(match.id);
    } catch (error) {
      console.error(' Error fetching states:', error);
    }
  };
  const fetchVehicleTypes = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/vehicle-types`, {
        auth: {username: 'vtruck', password: 'secret@123'},
      });
      setVehicleOptions(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
    }
  };

  fetchVehicleTypes();
  const handlePost = async () => {
    if (
      !pickupLocation ||
      !dropoffLocation ||
      !materialName ||
      !weight ||
      !amount ||
      !description ||
      !selectedVehicle
    ) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const payload = {
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      pick_lat: pickupLat,
      pick_lng: pickupLng,
      drop_lat: dropoffLat,
      drop_lng: dropoffLng,
      pick_state_id: pickupStateId,
      drop_state_id: dropoffStateId,
      material_name: materialName,
      weight: parseFloat(weight),
      description,
      amount: parseFloat(amount),
      amt_type: fixedPrice ? 'Fixed' : 'Negotiable',
      total_amt: parseFloat(amount),
      assigned_to: null,
      assigned_as: null,
      status: 1,
      load_type: 'POST_LOAD',
      visible_hours: limitVisibility ? parseInt(visibleHours) || 24 : 24,
      vehicle_type: selectedVehicle,
    };

    try {
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/load`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setSuccessVisible(true);
      setTimeout(() => {
        setSuccessVisible(false);
        navigation.navigate('ShipperTabs');
      }, 1500);
    } catch (error) {
      Alert.alert('Error', 'Failed to post load');
    }
  };

  const handleNext = () => {
    if (step === 1) {
      const newErrors = {
        pickupLocation: !pickupLocation,
        dropoffLocation: !dropoffLocation,
        materialName: !materialName,
        weight: !weight,
        description: !description,
        selectedVehicle: false,
      };
      setErrors(newErrors);
      if (Object.values(newErrors).some(Boolean)) return;
      setStep(2);
    } else if (step === 2) {
      const newErrors = {
        ...errors,
        selectedVehicle: !selectedVehicle,
      };
      setErrors(newErrors);
      if (newErrors.selectedVehicle) return;
      setStep(3);
    } else {
      handlePost();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => {
              if (step > 1) {
                setStep(step - 1);
              } else {
                navigation.navigate('ShipperTabs');
              }
            }}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{t('post_load')}</Text>
          <View style={{width: 24}} />
        </View>

        <View style={styles.stepContainer}>
          <Text style={[styles.stepLabel, step === 1 && styles.activeStep]}>
            ① {t('load_details')}
          </Text>
          <Text style={styles.stepSeparator}>—</Text>
          <Text style={[styles.stepLabel, step === 2 && styles.activeStep]}>
            ② {t('vehicle_type')}
          </Text>
          <Text style={styles.stepSeparator}>—</Text>
          <Text style={[styles.stepLabel, step === 3 && styles.activeStep]}>
            ③ {t('post')}
          </Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {step === 1 && (
          <>
            <View
              style={[
                styles.iconInput,
                errors.pickupLocation && {borderColor: 'red'},
              ]}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <TouchableOpacity
                style={styles.touchInput}
                onPress={() =>
                  navigation.navigate('MapScreen', {
                    sourceScreen: 'AddLoad',
                    field: 'pickup',
                    userType,
                    dropoffLocation,
                    dropoffLat,
                    dropoffLng,
                    pickupLocation,
                    pickupLat,
                    pickupLng,
                  })
                }>
                <Text
                  style={
                    pickupLocation ? styles.inputText : styles.placeholderText
                  }>
                  {pickupLocation || t('pickup_point')}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.iconInput,
                errors.dropoffLocation && {borderColor: 'red'},
              ]}>
              <Ionicons
                name="pin-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <TouchableOpacity
                style={styles.touchInput}
                onPress={() =>
                  navigation.navigate('MapScreen', {
                    field: 'dropoff',
                    sourceScreen: 'AddLoad',
                    userType,
                    dropoffLocation,
                    dropoffLat,
                    dropoffLng,
                    pickupLocation,
                    pickupLat,
                    pickupLng,
                  })
                }>
                <Text
                  style={
                    dropoffLocation ? styles.inputText : styles.placeholderText
                  }>
                  {dropoffLocation || t('drop_point')}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.iconInput,
                errors.materialName && {borderColor: 'red'},
              ]}>
              <Ionicons
                name="cube-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <TextInput
                style={styles.textInput}
                placeholder= {t('material_name')}
                placeholderTextColor="#888"
                value={materialName}
                onChangeText={setMaterialName}
              />
            </View>

            <View
              style={[styles.iconInput, errors.weight && {borderColor: 'red'}]}>
              <Ionicons
                name="barbell-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <TextInput
                style={styles.textInput}
                placeholder={t('tonnes')}
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
              />
            </View>

            <View
              style={[
                styles.iconInput,
                errors.description && {borderColor: 'red'},
              ]}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <TextInput
                style={[styles.textInput, {height: 80}]}
                placeholder={t('description')}
                placeholderTextColor="#888"
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <View style={styles.vehicleGrid}>
            {vehicleOptions.map(vehicle => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  selectedVehicle === vehicle.id.toString() &&
                    styles.vehicleCardSelected,
                  errors.selectedVehicle &&
                    !selectedVehicle && {borderColor: 'red'},
                ]}
                onPress={() => {
                  setSelectedVehicle(vehicle.id.toString());
                  setErrors(prev => ({...prev, selectedVehicle: false}));
                }}>
                <Text style={styles.vehicleLabel}>{vehicle.title}</Text>
                <Text style={styles.vehicleRange}>
                  {vehicle.min_weight} - {vehicle.max_weight} KG
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <>
            <View style={styles.iconInput}>
              <Ionicons
                name="cash-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <TextInput
                style={[styles.textInput, {flex: 1}]}
                placeholder={t('amount')}
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <View style={styles.inlineToggle}>
                <Text style={styles.toggleLabel}>
                  {fixedPrice ? t('fixed') : t('negotiable')}
                </Text>
                <Switch
                  value={fixedPrice}
                  onValueChange={setFixedPrice}
                  thumbColor={fixedPrice ? '#009FFD' : '#ccc'}
                />
              </View>
            </View>

            <View style={styles.iconInput}>
              <Ionicons
                name="time-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <TextInput
                style={[styles.textInput, {flex: 1}]}
                placeholder={t('visible_hours')}
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={visibleHours}
                onChangeText={setVisibleHours}
                editable={limitVisibility}
              />
              <View style={styles.inlineToggle}>
                <Text style={styles.toggleLabel}>
                  {limitVisibility ? t('hours') : t('not_fix')}
                </Text>
                <Switch
                  value={limitVisibility}
                  onValueChange={setLimitVisibility}
                  thumbColor={limitVisibility ? '#009FFD' : '#ccc'}
                />
              </View>
            </View>

            <ContactModal
              visible={showPickupModal}
              onClose={() => setShowPickupModal(false)}
              title="Pickup Contact"
              contact={pickupContact}
              setContact={setPickupContact}
            />
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => setShowPickupModal(true)}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <Text style={styles.contactButtonText}>
                {pickupContact.name
                  ? `Pickup: ${pickupContact.name} (${pickupContact.phone})`
                  : t('add_pickup_contact')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => setShowDropModal(true)}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#009FFD"
                style={styles.icon}
              />
              <Text style={styles.contactButtonText}>
                {dropContact.name
                  ? `Drop: ${dropContact.name} (${dropContact.phone})`
                  : t('add_drop_contact')}
              </Text>
            </TouchableOpacity>

            <ContactModal
              visible={showDropModal}
              onClose={() => setShowDropModal(false)}
              title="Drop Contact"
              contact={dropContact}
              setContact={setDropContact}
            />
          </>
        )}

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitBtn} onPress={handleNext}>
          <Text style={styles.submitText}>
            {step === 3 ? t('post_load') : t('next')}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <Ionicons name="checkmark-circle" size={100} color="green" />
          <Text style={styles.successText}>{t('load_posted_success')}!</Text>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#007BFF',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 35,
  },
  headerTitle: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepText: {marginTop: 4, fontSize: 16, color: 'white'},
  container: {padding: 20},
  inputBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 14,
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vehicleCard: {
    width: '48%',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  vehicleCardSelected: {
    borderColor: '#007BFF',
    backgroundColor: '#E0F5FF',
  },
  submitBtn: {
    backgroundColor: '#007BFF',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  vehicleLabel: {fontWeight: 'bold'},
  vehicleRange: {fontSize: 12, color: '#777'},
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  submitText: {color: '#fff', fontWeight: 'bold'},
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    color: 'white',
    fontSize: 18,
    marginTop: 12,
    fontWeight: 'bold',
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  icon: {
    marginRight: 8,
  },
  touchInput: {
    flex: 1,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
  placeholderText: {
    color: '#888',
  },
  inputText: {
    color: '#000',
  },
  stepContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  stepLabel: {
    fontSize: 16,
    color: '#ccc',
    marginHorizontal: 4,
  },
  activeStep: {
    color: 'white',
    fontWeight: 'bold',
  },
  stepSeparator: {
    fontSize: 16,
    color: '#ccc',
    marginHorizontal: 4,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 10,
  },
  contactButtonText: {
    marginLeft: 10,
    color: '#333',
  },
  inlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },

  toggleLabel: {
    fontSize: 12,
    marginRight: 4,
    color: '#555',
  },
});

export default AddLoadScreen;
