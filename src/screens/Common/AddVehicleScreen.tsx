import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  PermissionsAndroid,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {launchImageLibrary} from 'react-native-image-picker';

const BASE_URL = 'https://2maato.com/api';

type RootStackParamList = {
  AddVehicle: {selectedRoutes?: number[]; formData?: any};
};

type AddVehicleScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddVehicle'>;
  route: RouteProp<RootStackParamList, 'AddVehicle'>;
};

const AddVehicleScreen: React.FC<AddVehicleScreenProps> = ({
  navigation,
  route,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const formDataRef = useRef({
    vehicleNumber: '',
    vehicleTypeId: '',
    currLocation: '',
    currStateId: '1',
    description: '',
    weight: '',
  });

  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleTypeId, setVehicleTypeId] = useState('');
  const [currLocation, setCurrLocation] = useState('');
  const [currStateId, setCurrStateId] = useState('1');
  const [description, setDescription] = useState('');
  const [weight, setWeight] = useState('');
  const [routes, setRoutes] = useState<number[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [document, setDocument] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  const [showRouteModal, setShowRouteModal] = useState(false);

  const goBackStep = () => {
    if (step > 1) setStep(step - 1);
    else navigation.goBack();
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehicleRes, stateRes] = await Promise.all([
          axios.get(`${BASE_URL}/vehicle-types`, {
            auth: {username: 'vtruck', password: 'secret@123'},
          }),
          axios.get(`${BASE_URL}/states/by-country/1`, {
            auth: {username: 'vtruck', password: 'secret@123'},
          }),
        ]);

        setVehicleTypes(vehicleRes.data.data || []);
        const stateList = Array.isArray(stateRes.data) ? stateRes.data : [];
        setStates(stateList);
      } catch (err) {
        Alert.alert('Error', 'Failed to load vehicle types or states.');
      } finally {
        setLoading(false);
      }

      await getSafeLocation();
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (route.params?.selectedRoutes) {
      setRoutes(route.params.selectedRoutes);
    }
    if (route.params?.formData) {
      const data = route.params.formData;
      formDataRef.current = data;
      setVehicleNumber(data.vehicleNumber || '');
      setVehicleTypeId(data.vehicleTypeId || '');
      setCurrLocation(data.currLocation || '');
      setWeight(data.weight || '');
    }
  }, [route.params]);

  const getSafeLocation = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;

      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          const loc = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(
            4,
          )}`;
          setCurrLocation(loc);
          formDataRef.current.currLocation = loc;
        },
        error => {
          Alert.alert('Location Error', error.message);
        },
        {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
      );
    } catch {
      Alert.alert('Error', 'Location error.');
    }
  };

  const onVehicleNumberChange = (val: string) => {
    formDataRef.current.vehicleNumber = val;
    setVehicleNumber(val);
  };

  const onVehicleTypeChange = (val: string) => {
    formDataRef.current.vehicleTypeId = val;
    setVehicleTypeId(val);
  };

  const onWeightChange = (val: string) => {
    formDataRef.current.weight = val;
    setWeight(val);
  };

  const toggleRouteSelection = (id: number) => {
    if (routes.includes(id)) {
      setRoutes(routes.filter(r => r !== id));
    } else {
      setRoutes([...routes, id]);
    }
  };

  const handleImageSelect = async () => {
    const result = await launchImageLibrary({mediaType: 'photo'});
    if (result.assets && result.assets.length > 0) {
      setDocument(result.assets[0]);
      setErrors(e => ({...e, document: false}));
    }
  };

  const handleSubmit = async () => {
    if (step === 1) {
      const newErrors: {[key: string]: boolean} = {};
      if (!vehicleNumber) newErrors.vehicleNumber = true;
      if (!vehicleTypeId) newErrors.vehicleTypeId = true;

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        scrollRef.current?.scrollTo({y: 0, animated: true});
        return;
      }

      setErrors({});
      setStep(2);
      return;
    }

    if (step === 2) {
      if (routes.length === 0) {
        setShowRouteModal(true);
        return;
      }
      setStep(3);
      return;
    }

    if (step === 3) {
      if (!document) {
        setErrors({document: true});
        scrollRef.current?.scrollTo({y: 0, animated: true});
        return;
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const formData = new FormData();
      formData.append('vehicle_number', vehicleNumber);
      formData.append('vehicle_type_id', vehicleTypeId);
      formData.append('curr_location', currLocation);
      formData.append('curr_state_id', currStateId);
      formData.append('description', description);
      formData.append('weight', weight);
      formData.append('status', 'available');
      formData.append(
        'routes',
        JSON.stringify(routes.map(id => ({state_id: id}))),
      );
      formData.append('document', {
        uri: document.uri,
        type: document.type,
        name: document.fileName || 'rc.jpg',
      });

      try {
        await axios.post(`${BASE_URL}/vehicles`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });
        navigation.goBack();
      } catch {
        Alert.alert('Error', 'Failed to submit vehicle');
      }
    }
  };

  const StepHeader = () => (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={goBackStep} style={styles.backButton}>
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.title}>ADD VEHICLE</Text>
        <View style={styles.stepRow}>
          <Text style={[styles.stepText, step === 1 && styles.stepActive]}>
            ① Vehicle Info
          </Text>
          <Text style={[styles.stepText, step === 2 && styles.stepActive]}>
            ② Routes
          </Text>
          <Text style={[styles.stepText, step === 3 && styles.stepActive]}>
            ③ Documents
          </Text>
        </View>
      </View>
      <View style={{width: 26}} />
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{marginTop: 100}} />;
  }

  return (
    <View>
      <ScrollView ref={scrollRef}>
        <View style={styles.formPadding}>
          <StepHeader />

          {step === 1 && (
            <>
              <View
                style={[
                  styles.inputContainer,
                  errors.vehicleNumber && {borderColor: 'red'},
                ]}>
                <Ionicons
                  name="cube-outline"
                  size={20}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Vehicle Number"
                  placeholderTextColor="#888"
                  style={styles.inputWithIcon}
                  value={vehicleNumber}
                  autoCapitalize="characters"
                  onChangeText={val => {
                    setErrors(e => ({...e, vehicleNumber: false}));
                    onVehicleNumberChange(val);
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="fitness-outline"
                  size={20}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Weight (in tonnes)"
                  placeholderTextColor="#888"
                  style={styles.inputWithIcon}
                  value={weight}
                  onChangeText={onWeightChange}
                  keyboardType="numeric"
                />
              </View>

              <Text style={styles.label}>Select Vehicle Type</Text>
              <View style={styles.cardContainer}>
                {vehicleTypes.map(type => {
                  const isSelected = vehicleTypeId === String(type.id);
                  return (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.card,
                        isSelected && styles.selectedCard,
                        errors.vehicleTypeId &&
                          !vehicleTypeId && {borderColor: 'red'},
                      ]}
                      onPress={() => {
                        setErrors(e => ({...e, vehicleTypeId: false}));
                        onVehicleTypeChange(String(type.id));
                      }}>
                      <Text style={styles.cardTitle}>{type.title}</Text>
                      <Text style={styles.cardSubTitle}>
                        {type.min_weight} - {type.max_weight} T
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 2 && (
            <View style={styles.routeGrid}>
              {states.map(state => {
                const isSelected = routes.includes(state.id);
                return (
                  <TouchableOpacity
                    key={state.id}
                    style={[
                      styles.routeCard,
                      isSelected && styles.selectedRouteCard,
                    ]}
                    onPress={() => toggleRouteSelection(state.id)}>
                    <Ionicons
                      name="navigate-outline"
                      size={20}
                      color="#005EFF"
                    />
                    <Text style={styles.routeCardText}>{state.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 3 && (
            <View style={{marginTop: 10}}>
              <Text style={styles.label}>Upload RC Book</Text>
              {document ? (
                <View style={{marginBottom: 15}}>
                  <Image
                    source={{uri: document.uri}}
                    style={{width: '100%', height: 200, borderRadius: 8}}
                  />
                  <TouchableOpacity
                    onPress={() => setDocument(null)}
                    style={{position: 'absolute', top: 5, right: 5}}>
                    <Ionicons name="close-circle" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.routeButton}
                    onPress={handleImageSelect}>
                    <Text style={styles.buttonText}>Pick Document</Text>
                  </TouchableOpacity>
                  {errors.document && (
                    <Text style={{color: 'red', marginTop: 5}}>
                      Please upload a document
                    </Text>
                  )}
                </>
              )}
            </View>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>
              {step < 3 ? 'Next' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        transparent
        animationType="fade"
        visible={showRouteModal}
        onRequestClose={() => setShowRouteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Routes</Text>
            <Text style={styles.modalMessage}>
              Please select at least one route.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowRouteModal(false)}>
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddVehicleScreen;

const styles = StyleSheet.create({
  container: {},
  headerContainer: {
    backgroundColor: '#007bff',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginBottom: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 160,
    marginHorizontal: -10,
    marginVertical: -10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  backButton: {
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 55,
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginTop: 30,
    width: '100%',
    paddingHorizontal: 10,
    gap: 8,
    marginLeft: -70,
  },
  stepText: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: '600',
    textAlign: 'center',
  },
  formPadding: {
    padding: 10,
  },
  stepActive: {color: '#fff'},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  inputWithIcon: {flex: 1, height: 45, marginLeft: 10},
  inputIcon: {color: '#005EFF'},
  label: {fontWeight: 'bold', marginBottom: 10, marginTop: 10},
  cardContainer: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  selectedCard: {borderColor: '#005EFF', borderWidth: 2},
  cardTitle: {fontWeight: 'bold', fontSize: 14},
  cardSubTitle: {fontSize: 12, color: '#666'},
  routeButton: {
    backgroundColor: '#2176ff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  nextButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  buttonText: {color: '#fff', fontWeight: 'bold'},
  routeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  routeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedRouteCard: {borderColor: '#005EFF', backgroundColor: '#E6F0FF'},
  routeCardText: {marginLeft: 10, color: '#007bff', fontWeight: '600'},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#005EFF',
  },
  modalMessage: {
    fontSize: 14,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
