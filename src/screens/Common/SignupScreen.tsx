import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { RootStackParamList } from '../../navigation/AppNavigator';

const BASE_URL = 'https://2maato.com/api';

const userTypes = [
  { label: 'SHIPPER', value: 'shipper' },
  { label: 'DRIVER', value: 'driver' },
  { label: 'TRANSPORTER', value: 'transporter' },
];

type NavigationProp = StackNavigationProp<RootStackParamList, 'Signup'>;

const SignupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('shipper');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();
    const trimmedUserType = userType.trim();

    if (
      trimmedName === '' ||
      trimmedPhone.length !== 10 ||
      trimmedPassword === '' ||
      trimmedConfirmPassword === '' ||
      trimmedUserType === ''
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/register`,
        {
          name: trimmedName,
          phone: trimmedPhone,
          email: trimmedEmail,
          password: trimmedPassword,
          user_type: trimmedUserType,
        },
        {
          auth: {
            username: 'vtruck',
            password: 'secret@123',
          },
        }
      );

      await axios.post(
        `${BASE_URL}/request-otp`,
        { phone: trimmedPhone },
        {
          auth: {
            username: 'vtruck',
            password: 'secret@123',
          },
        }
      );

      navigation.navigate('OTP', { phone: trimmedPhone, userType: trimmedUserType });
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data && err.response.data.errors) {
        const errors = err.response.data.errors;
        let errorMessages = '';

        Object.entries(errors).forEach(([_, value]) => {
          if (Array.isArray(value)) {
            value.forEach((msg) => {
              errorMessages += `• ${msg}\n`;
            });
          }
        });

        Alert.alert('Signup failed', errorMessages.trim());
      } else {
        Alert.alert('Signup failed', 'Unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up for VTRUCK</Text>

        <TextInput
          placeholder="Full Name"
          placeholderTextColor="#666"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <TextInput
          placeholder="Phone"
          placeholderTextColor="#666"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={10}
          value={phone}
          onChangeText={setPhone}
        />

        <TextInput
          placeholder="Email (optional)"
          placeholderTextColor="#666"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#666"
            style={styles.input}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={22}
            color="#666"
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          />
        </View>

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Confirm Password"
            placeholderTextColor="#666"
            style={styles.input}
            secureTextEntry={!showConfirmPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Ionicons
            name={showConfirmPassword ? 'eye-off' : 'eye'}
            size={22}
            color="#666"
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </View>

        <Text style={styles.label}>Select Type</Text>
        <View style={styles.typeRow}>
          {userTypes.map((type, index) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                userType === type.value && styles.activeType,
                index === userTypes.length - 1 && styles.lastButton,
              ]}
              onPress={() => setUserType(type.value)}
            >
              <Text
                style={[
                  styles.typeText,
                  userType === type.value && styles.activeText,
                  type.label.length > 9 && { fontSize: 13 },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Register & Send OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#009FFD', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#444', marginTop: 10, marginBottom: 4 },
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
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 14,
    top: 20,
    zIndex: 10,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    paddingHorizontal: 4,
  },
  lastButton: {
    marginRight: 0,
  },
  activeType: {
    backgroundColor: '#009FFD',
  },
  typeText: {
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  activeText: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#009FFD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
});

export default SignupScreen;
