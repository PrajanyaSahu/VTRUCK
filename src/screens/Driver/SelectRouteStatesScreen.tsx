import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import axios from 'axios';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'https://2maato.com/api';

type RootStackParamList = {
  SelectRouteStates: { selected: number[]; formData: any };
  AddVehicle: { selectedRoutes: number[]; formData: any };
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'SelectRouteStates'>;
  route: RouteProp<RootStackParamList, 'SelectRouteStates'>;
};

const SelectRouteStatesScreen: React.FC<Props> = ({ navigation, route }) => {
  const [states, setStates] = useState<any[]>([]);
  const [filteredStates, setFilteredStates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>(route.params?.selected || []);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/states/by-country/1`, {
        auth: { username: 'vtruck', password: 'secret@123' },
      });
      const stateList = Array.isArray(res.data) ? res.data : [];
      setStates(stateList);
      setFilteredStates(stateList);
    } catch (err) {
      console.error('Fetch states error:', err);
      Alert.alert('Error', 'Could not fetch states.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const confirmSelection = () => {
    navigation.navigate('AddVehicle', {
      selectedRoutes: selected,
      formData: route.params.formData,
    });
  };

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text) {
      setFilteredStates(states);
    } else {
      const filtered = states.filter((item) =>
        item.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredStates(filtered);
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 100 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search state..."
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#888" style={styles.clearIcon} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredStates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.selectedItem]}
              onPress={() => toggleSelection(item.id)}
            >
              <Text style={styles.itemText}>{item.title}</Text>
            </TouchableOpacity>
          );
        }}
      />
      <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirm Selection</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SelectRouteStatesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  searchIcon: {
    marginRight: 5,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  clearIcon: {
    marginLeft: 5,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  selectedItem: {
    backgroundColor: '#d0e8ff',
  },
  itemText: {
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: '#2176ff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});
