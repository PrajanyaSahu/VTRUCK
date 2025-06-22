import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../navigation/AppNavigator';

const BASE_URL = 'https://2maato.com/api';

type OTPScreenRouteProp = RouteProp<RootStackParamList, 'OTP'>;
type OTPScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTP'>;

const OTPScreen: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<OTPScreenNavigationProp>();
  const route = useRoute<OTPScreenRouteProp>();
  const { phone } = route.params;
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (val: string, idx: number) => {
    const newOtp = otp.split('');
    newOtp[idx] = val[val.length - 1] || '';
    const joined = newOtp.join('').slice(0, 6);
    setOtp(joined);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    else if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return Alert.alert('Error', 'Enter 6-digit OTP');

    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/verify-otp`,
        { phone, otp },
        {
          auth: {
            username: 'vtruck',
            password: 'secret@123',
          },
        }
      );

      const token = res.data?.token;
      const role = res.data?.role;

      if (!token || !role) throw new Error('Missing token or role');

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userType', role.toLowerCase());

      const lowerRole = role.toLowerCase();

      if (lowerRole === 'shipper') {
        navigation.reset({ index: 0, routes: [{ name: 'ShipperTabs' }] });
      } else if (lowerRole === 'transporter') {
        navigation.reset({ index: 0, routes: [{ name: 'TransporterTabs' }] });
      } else if (lowerRole === 'driver') {
        navigation.reset({ index: 0, routes: [{ name: 'DriverHome' }] });
      } else {
        Alert.alert('Error', `Unknown role: ${lowerRole}`);
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Invalid OTP or unauthorized');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Enter OTP</Text>
      <Text style={styles.subheading}>Sent to {phone}</Text>
      <View style={styles.otpRow}>
        {Array(6).fill(0).map((_, idx) => (
          <TextInput
            key={idx}
            ref={(el) => { inputs.current[idx] = el!; }}
            style={styles.otpBox}
            keyboardType="number-pad"
            maxLength={1}
            value={otp[idx] || ''}
            onChangeText={(val) => handleChange(val, idx)}
            autoFocus={idx === 0}
          />
        ))}
      </View>
      <TouchableOpacity
        style={[styles.button, { opacity: otp.length === 6 ? 1 : 0.5 }]}
        onPress={handleVerify}
        disabled={otp.length !== 6 || loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Verify & Continue</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff', justifyContent: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', color: '#009FFD', textAlign: 'center', marginBottom: 10 },
  subheading: { fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  otpBox: {
    borderWidth: 2,
    borderColor: '#009FFD',
    borderRadius: 10,
    width: 44,
    height: 56,
    marginHorizontal: 6,
    fontSize: 30,
    color: '#222',
    textAlign: 'center',
    backgroundColor: '#F8F8F8',
  },
  button: {
    backgroundColor: '#009FFD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default OTPScreen;
