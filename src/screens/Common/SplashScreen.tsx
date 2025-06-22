import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';

type SplashScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const role = await AsyncStorage.getItem('userType');

        if (!token || !role) {
          navigation.replace('Login');
          return;
        }

        const response = await fetch('https://2maato.com/api/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.status === 403 || response.status === 401 || !response.ok) {
          throw new Error('Token invalid or expired');
        }

        if (role === 'shipper') {
          navigation.replace('ShipperTabs');
        } else if (role === 'transporter') {
          navigation.replace('TransporterTabs');
        } else if (role === 'driver') {
          navigation.replace('DriverHome');
        } else {
          navigation.replace('Login');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.log('Redirecting to login due to error:', errorMessage);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('userType');
        navigation.replace('Login');
      }
    };

    setTimeout(checkLogin, 1500);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../../assets/Icon.png')} style={styles.logo} />
      <Text style={styles.appName}>VTRUCK</Text>
      <ActivityIndicator color="#fff" size="large" style={{ marginTop: 20 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#009FFD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SplashScreen;
