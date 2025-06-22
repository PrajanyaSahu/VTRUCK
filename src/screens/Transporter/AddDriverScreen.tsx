import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios, {AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const BASE_URL = 'https://2maato.com/api';

const AddDriverScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  const handleAddDriver = async () => {
    if (!name || !phone || !password) {
      Alert.alert('Name, phone, and password are required.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const payload: any = {
        name,
        phone,
        password,
      };
      if (email.trim()) payload.email = email;

      await axios.post(`${BASE_URL}/transporter/driver`, payload, {
        headers: {Authorization: `Bearer ${token}`},
      });

      Alert.alert('Driver added successfully!');
      navigation.goBack();
    } catch (err) {
      const error = err as AxiosError;
      console.error(
        'Error adding driver:',
        error.response?.data || error.message,
      );
      Alert.alert('Failed to add driver. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ADD NEW DRIVER</Text>
      </View>

      {/* Form */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Name */}
        <View style={styles.inputGroup}>
          <Ionicons name="person" size={20} style={styles.icon} />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#999"
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Email */}
        <View style={styles.inputGroup}>
          <Ionicons name="mail" size={20} style={styles.icon} />
          <TextInput
            placeholder="Email (optional)"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            keyboardType="email-address"
            onChangeText={setEmail}
          />
        </View>

        {/* Phone */}
        <View style={styles.inputGroup}>
          <Ionicons name="call" size={20} style={styles.icon} />
          <TextInput
            placeholder="Phone Number"
            placeholderTextColor="#999"
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={text => {
              const cleaned = text.replace(/[^0-9]/g, '');
              setPhone(cleaned);
            }}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Ionicons name="lock-closed" size={20} style={styles.icon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.button} onPress={handleAddDriver}>
          <Text style={styles.buttonText}>Submit Driver</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default AddDriverScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8fafd',
  },
  header: {
    height: 100,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: 'absolute',
    left: 12,
    padding: 8,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff',
  },
  container: {
    padding: 20,
    flexGrow: 1,
    marginTop: 100,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  icon: {
    marginRight: 10,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
