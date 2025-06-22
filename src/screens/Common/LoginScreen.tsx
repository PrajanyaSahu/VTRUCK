import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import qs from 'qs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

const BASE_URL = 'https://2maato.com/api';

type NavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [useOtpLogin, setUseOtpLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/settings`, {
          auth: { username: 'vtruck', password: 'secret@123' },
        });
        setUseOtpLogin(res.data.data.otp_auth === '1');
      } catch (err) {
        console.error('Failed to fetch login method:', err);
        Alert.alert('Error', 'Failed to fetch app settings');
      } finally {
        setSettingsLoaded(true);
      }
    };

    fetchSettings();
  }, []);

  const handleOTPLogin = async () => {
    if (phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/request-otp`,
        { phone },
        {
          auth: { username: 'vtruck', password: 'secret@123' },
        }
      );

      navigation.navigate('OTP', { phone });
    } catch (error) {
      console.error(error);
      Alert.alert('OTP request failed', 'Phone not found or server error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (phone.length !== 10 || !password.trim()) {
      Alert.alert('Error', 'Enter valid phone and password');
      return;
    }

    setLoading(true);
    try {
      const data = qs.stringify({ phone, password });

      const res = await axios.post(`${BASE_URL}/login`, data, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        auth: { username: 'vtruck', password: 'secret@123' },
      });

      const { token, role = 'shipper' } = res.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userType', role.toLowerCase());

      if (role.toLowerCase() === 'shipper' || role.toLowerCase() === 'transport') {
        navigation.reset({ index: 0, routes: [{ name: 'ShipperHome' }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: 'DriverHome' }] });
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login failed', 'Invalid phone or password');
    } finally {
      setLoading(false);
    }
  };

  if (!settingsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#009FFD" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.heading}>Login to VTRUCK</Text>

      <TextInput
        style={styles.input}
        placeholder="Phone"
        placeholderTextColor="#666"
        keyboardType="number-pad"
        maxLength={10}
        value={phone}
        onChangeText={setPhone}
      />

      {!useOtpLogin && (
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      )}

      <TouchableOpacity
        style={[styles.button, { opacity: phone.length === 10 ? 1 : 0.5 }]}
        onPress={useOtpLogin ? handleOTPLogin : handlePasswordLogin}
        disabled={loading || phone.length !== 10}
      >
        {loading ? <ActivityIndicator color="#fff" /> : (
          <Text style={styles.buttonText}>{useOtpLogin ? 'Send OTP' : 'Login'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#009FFD', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#F8F8F8',
    color: '#000',
  },
  button: {
    backgroundColor: '#009FFD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  link: { color: '#009FFD', marginTop: 20, textAlign: 'center' },
});

export default LoginScreen;
