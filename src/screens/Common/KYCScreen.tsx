import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  KeyboardTypeOptions,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE_URL = 'https://2maato.com/api';

const KYCScreen = ({ navigation }: any) => {
  const [userType, setUserType] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const [form, setForm] = useState({
    aadhaarNumber: '',
    panNumber: '',
    licenseNumber: '',
    companyName: '',
    companyAddress: '',
  });

  const [files, setFiles] = useState<any>({
    aadhaar_front: null,
    aadhaar_back: null,
    pan_front: null,
    pan_back: null,
    license_front: null,
    license_back: null,
    business_document: null,
  });

  useEffect(() => {
    const loadUserData = async () => {
      const type = await AsyncStorage.getItem('userType');
      setUserType(type);

      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get(`${BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setStatus(res.data?.user?.status || null);
      } catch (e) {
        console.error('Error fetching status', e);
      }
    };

    loadUserData();
  }, []);

  const pickFile = async (key: string) => {
    const result = await launchImageLibrary({ mediaType: 'mixed' });
    if (result.assets && result.assets.length > 0) {
      setFiles((prev: any) => ({ ...prev, [key]: result.assets![0] }));
    }
  };

  const removeFile = (key: string) => {
    setFiles((prev: any) => ({ ...prev, [key]: null }));
  };

  const isRequired = (key: string) => {
    if (userType === 'driver') {
      return ['aadhaarNumber', 'aadhaar_front', 'aadhaar_back', 'licenseNumber', 'license_front', 'license_back'].includes(key);
    } else {
      return ['aadhaarNumber', 'aadhaar_front', 'aadhaar_back', 'panNumber', 'pan_front', 'pan_back', 'companyName', 'companyAddress', 'business_document'].includes(key);
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!/^\d{12}$/.test(form.aadhaarNumber)) newErrors['aadhaarNumber'] = true;
    if ((userType !== 'driver') && !/^([A-Z]{5}[0-9]{4}[A-Z])$/.test(form.panNumber)) newErrors['panNumber'] = true;

    Object.keys(form).forEach((key) => {
      if (isRequired(key) && !form[key as keyof typeof form]) {
        newErrors[key] = true;
      }
    });

    Object.keys(files).forEach((key) => {
      if (isRequired(key) && !files[key]) {
        newErrors[key] = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all required fields correctly.');
      return;
    }

    const formData = new FormData();
    formData.append('aadhaar_number', form.aadhaarNumber);
    formData.append('pan_number', form.panNumber);
    formData.append('license_number', form.licenseNumber);
    formData.append('company_name', form.companyName);
    formData.append('company_address', form.companyAddress);

    const appendFile = (key: string, file: any) => {
      formData.append(key, {
        uri: file.uri,
        type: file.type,
        name: file.fileName,
      });
    };

    Object.entries(files).forEach(([key, file]) => {
      if (file) appendFile(key, file);
    });

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      await axios.post(`${BASE_URL}/kyc/submit`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setStatus('pending');

      Alert.alert('Success', 'KYC submitted successfully', [
        {
          text: 'OK',
          onPress: () => {
            if (userType === 'shipper') {
              navigation.reset({ index: 0, routes: [{ name: 'ShipperHome' }] });
            } else if (userType === 'transporter') {
              navigation.reset({ index: 0, routes: [{ name: 'TransporterHome' }] });
            } else {
              navigation.reset({ index: 0, routes: [{ name: 'DriverHome' }] });
            }
          },
        },
      ]);
    } catch (err: any) {
      if (err.response?.status === 422) {
        const errorMessages = Object.values(err.response.data.errors).flat().join('\n');
        Alert.alert('Validation Failed', errorMessages);
      } else {
        Alert.alert('Error', 'Something went wrong');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label: string, key: string, keyboardType: KeyboardTypeOptions = 'default') => (
    <TextInput
      key={key}
      style={[styles.input, errors[key] && styles.inputError]}
      placeholder={label}
      placeholderTextColor="#666"
      value={form[key as keyof typeof form]}
      keyboardType={keyboardType}
      maxLength={key === 'aadhaarNumber' ? 12 : key === 'panNumber' ? 10 : undefined}
      onChangeText={(text) => setForm((prev) => ({ ...prev, [key]: text }))}
    />
  );

  const renderFileUpload = (label: string, key: string) => (
    <View key={key} style={styles.uploadBox}>
      <TouchableOpacity
        style={[styles.uploadBtn, errors[key] && { borderColor: 'red' }]}
        onPress={() => pickFile(key)}
      >
        {files[key] ? (
          <Image source={{ uri: files[key].uri }} style={styles.imagePreview} />
        ) : (
          <Text style={styles.uploadText}>{label}</Text>
        )}
      </TouchableOpacity>
      {files[key] && (
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeFile(key)}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (status === 'pending') {
    return (
      <View style={[styles.container, { justifyContent: 'center', flex: 1 }]}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: '#555' }}>
          Your KYC has been submitted and is under review.
        </Text>
      </View>
    );
  }

  if (status === 'verified') {
    return (
      <View style={[styles.container, { justifyContent: 'center', flex: 1 }]}>
        <Text style={{ fontSize: 16, textAlign: 'center', color: 'green' }}>
          Your KYC has been verified successfully.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>KYC for {userType?.toUpperCase()}</Text>

      {userType !== 'driver' && (
        <>
          {renderInput('Company Name', 'companyName')}
          {renderInput('Company Address', 'companyAddress')}
        </>
      )}
      {renderInput('Aadhaar Number', 'aadhaarNumber', 'number-pad')}
      {userType !== 'driver' && renderInput('PAN Number', 'panNumber')}
      {userType === 'driver' && renderInput('License Number', 'licenseNumber')}

      {renderFileUpload('Upload Aadhaar Front', 'aadhaar_front')}
      {renderFileUpload('Upload Aadhaar Back', 'aadhaar_back')}

      {userType !== 'driver' && (
        <>
          {renderFileUpload('Upload PAN Front', 'pan_front')}
          {renderFileUpload('Upload PAN Back', 'pan_back')}
          {renderFileUpload('Upload Business Proof Document', 'business_document')}
        </>
      )}

      {userType === 'driver' && (
        <>
          {renderFileUpload('Upload License Front', 'license_front')}
          {renderFileUpload('Upload License Back', 'license_back')}
        </>
      )}

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit KYC</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default KYCScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  backBtn: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#f8f8f8',
    color: '#000',
  },
  inputError: {
    borderColor: 'red',
  },
  uploadBox: {
    marginBottom: 14,
  },
  uploadBtn: {
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  uploadText: {
    fontSize: 16,
    color: '#333',
  },
  removeBtn: {
    marginTop: 8,
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitBtn: {
    backgroundColor: '#009FFD',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});