import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList} from '../../navigation/AppNavigator';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
const BASE_URL = 'https://2maato.com/api';
type BookLorryScreenRouteProp = RouteProp<RootStackParamList, 'BookLorry'>;

const BookLorryScreen = () => {
  const route = useRoute<BookLorryScreenRouteProp>();
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'BookLorry'>>();

  const {lorry, from, to} = route.params;
  const [material, setMaterial] = useState('');
  const [tonnes, setTonnes] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isFixed, setIsFixed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const handleSubmit = () => {
    if (!material || !tonnes || !amount) {
      setShowValidation(true);
      return;
    }

    setShowValidation(false);
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
      navigation.navigate('ShipperTabs');
    }, 2000);
  };
  if (showSuccess) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Ionicons name="checkmark-circle" size={120} color="green" />
        <Text style={styles.successText}>Request Sent</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Top Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}>
              <Ionicons name="arrow-back" size={30} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>SEND REQUEST</Text>
            </View>
          </View>

          {/* Location Display */}
          <View style={styles.locationWrapper}>
            <View style={styles.locationBox}>
              <Ionicons name="location" size={16} color="#007bff" />
              <Text style={styles.locationText}>{from.description}</Text>
            </View>

            <View style={styles.locationBox}>
              <Ionicons name="location" size={16} color="#007bff" />
              <Text style={styles.locationText}>{to.description}</Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.form}>
            <TextInput
              placeholder="Material Name"
              placeholderTextColor="#888"
              value={material}
              onChangeText={setMaterial}
              style={[
                styles.input,
                showValidation && !material && styles.invalidInput,
              ]}
            />
            <TextInput
              placeholder="Number of Tonnes"
              placeholderTextColor="#888"
              value={tonnes}
              onChangeText={setTonnes}
              keyboardType="numeric"
              style={[
                styles.input,
                showValidation && !material && styles.invalidInput,
              ]}
            />
            <TextInput
              placeholder="Description"
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, {height: 100}]}
              multiline
            />
            <View style={styles.amountRow}>
              <TextInput
                placeholder="Amount"
                placeholderTextColor="#888"
                value={amount}
                onChangeText={setAmount}
                style={[
                  styles.input,
                  {flex: 1, marginRight: 8},
                  showValidation && !amount && styles.invalidInput,
                ]}
                keyboardType="numeric"
              />
              <View style={styles.switchContainer}>
                <Text style={styles.fixText}>
                  {isFixed ? 'Negotiable' : 'Fixed'}
                </Text>
                <Switch value={isFixed} onValueChange={setIsFixed} />
              </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Send Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default BookLorryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 35,
    paddingHorizontal: 16,
  },
  header: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: '#007bff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  locationWrapper: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    gap: 8,
  },
  invalidInput: {
    borderColor: 'red',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  successText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '600',
    color: 'green',
  },
  locationText: {
    color: '#333',
    fontSize: 16,
    flexShrink: 1,
  },
  form: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fixText: {
    marginRight: 6,
    fontSize: 16,
    color: '#444',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
