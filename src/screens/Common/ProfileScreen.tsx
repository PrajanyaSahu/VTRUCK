import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  BackHandler,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {StackNavigationProp} from '@react-navigation/stack';
import type {RootStackParamList} from '../../navigation/AppNavigator';
import {useTranslation} from 'react-i18next';
import LanguageSelector from '../../components/LanguageSelector';

type ProfileScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'Profile'>;
};

type User = {
  name: string;
  phone: string;
  status: 'pending' | 'verified' | 'rejected' | null;
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const {t, i18n} = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string | null>(null);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const setLanguage = async (code: string) => {
    await AsyncStorage.setItem('lang', code);
    i18n.changeLanguage(code);
  };
  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const type = await AsyncStorage.getItem('userType');
      setUserType(type);

      if (!token) {
        Alert.alert(t('not_logged_in'));
        navigation.replace('Login');
        return;
      }

      const response = await axios.get('https://2maato.com/api/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const res = response.data;

      setUser({
        name: res.user?.name || 'N/A',
        phone: res.user?.phone || 'N/A',
        status: res.kyc_status || null,
      });
    } catch (err: any) {
      console.error(
        'Profile fetch error:',
        err?.response?.status,
        err?.message,
      );
      if (err.response?.status === 403) {
        Alert.alert(t('session_expired'), t('please_login_again'));
        await AsyncStorage.clear();
        navigation.replace('Login');
      } else {
        Alert.alert(t('error'), t('fetch_profile_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const backAction = () => {
      if (userType === 'shipper') {
        navigation.replace('ShipperTabs');
      } else if (userType === 'driver') {
        navigation.replace('DriverHome');
      } else if (userType === 'transporter') {
        navigation.replace('TransporterTabs');
      } else {
        navigation.replace('Login');
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [userType]);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.replace('Login');
  };

  const renderKYCSection = () => {
    const status = user?.status;
    let icon = null;
    let label = '';
    let disabled = false;

    if (status === 'verified') {
      icon = (
        <Ionicons
          name="checkmark-circle-outline"
          size={16}
          color="green"
          style={{marginRight: 6}}
        />
      );
      label = t('kyc_verified');
      disabled = true;
    } else if (status === 'pending') {
      icon = (
        <Ionicons
          name="time-outline"
          size={16}
          color="#ff9800"
          style={{marginRight: 6}}
        />
      );
      label = t('kyc_pending');
      disabled = true;
    } else if (status === 'rejected') {
      icon = (
        <Ionicons
          name="close-circle-outline"
          size={16}
          color="red"
          style={{marginRight: 6}}
        />
      );
      label = t('kyc_rejected');
    } else {
      icon = (
        <Ionicons
          name="close-circle-outline"
          size={16}
          color="red"
          style={{marginRight: 6}}
        />
      );
      label = t('kyc_incomplete');
    }

    return (
      <TouchableOpacity
        style={[styles.infoCard, disabled && {backgroundColor: '#eee'}]}
        disabled={disabled}
        onPress={() => {
          if (!disabled) {
            navigation.navigate('KYC');
          }
        }}>
        <Text style={styles.label}>{t('kyc')}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          {icon}
          <Text style={styles.infoValue}>{label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const getLangName = (code: string) => {
    switch (code) {
      case 'en':
        return t('language.english');
      case 'hi':
        return t('language.hindi');
      default:
        return code;
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#009FFD" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={88} color="#009FFD" />
        <Text style={styles.name}>{user.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>{t('name')}</Text>
        <Text style={styles.infoValue}>{user.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.label}>{t('phone')}</Text>
        <Text style={styles.infoValue}>{user.phone}</Text>
      </View>

      {renderKYCSection()}

      {/* Change Language Button Styled Like Card */}
      <TouchableOpacity
        style={styles.infoCard}
        onPress={() => setLanguageModalVisible(true)}>
        <Text style={styles.label}>{t('change_language')}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.infoValue}>{getLangName(i18n.language)}</Text>
        </View>
      </TouchableOpacity>

      {/* Language Modal */}
      <Modal
        visible={languageModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLanguageModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>{t('change_language')}</Text>
            <LanguageSelector onSelect={() => setLanguageModalVisible(false)} />
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(false)}
              style={styles.modalCloseBtn}>
              <Text style={styles.modalCloseText}>
                {t('cancel') || 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#d32f2f" />
        <Text style={styles.logoutBtnText}>{t('logout')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 18,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 22,
  },
  name: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#009FFD',
    marginTop: 8,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
  },
  logoutBtnText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalCloseBtn: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;
