import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  route: { params: { vehicleId: number } };
  navigation: any;
};

const EditVehicleScreen: React.FC<Props> = ({ route, navigation }) => {
  const { vehicleId } = route.params;
  const [states, setStates] = useState<any[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchStates = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/states/by-country/1`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStates(res.data.data || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not load operational states.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const saveStates = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      await axios.post(
        `https://2maato.com/api/vehicles/${vehicleId}/states`,
        { states: selected },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('Success', 'Operational routes updated successfully.');
      navigation.goBack();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to update operational states.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#009FFD" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Edit Operational Routes</Text>
      {states.map(state => (
        <TouchableOpacity
          key={state.id}
          style={[
            styles.stateItem,
            selected.includes(state.id) && styles.selectedState,
          ]}
          onPress={() => toggleSelect(state.id)}
        >
          <Text style={styles.stateText}>{state.title}</Text>
          {selected.includes(state.id) && (
            <Ionicons name="checkmark-circle" size={20} color="#009FFD" />
          )}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.saveButton}
        onPress={saveStates}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#009FFD',
    marginBottom: 20,
  },
  stateItem: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  selectedState: {
    backgroundColor: '#e6f4ff',
    borderColor: '#009FFD',
  },
  stateText: {
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#009FFD',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditVehicleScreen;
