import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const API_KEY = 'AIzaSyBtHbi7VedBLnRVP9ph10ziegxlgfue-ZQ';

interface Props {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (place: { description: string; place_id: string }) => void;
  style?: any;
}

const GooglePlacesInput: React.FC<Props> = ({
  placeholder,
  value,
  onChangeText,
  onSelect,
  style,
}) => {
  const [results, setResults] = useState<any[]>([]);
  const [showList, setShowList] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const userTyped = useRef(false);

  useEffect(() => {
    if (!value || value.length < 1 || hasSelected || !userTyped.current) {
      setResults([]);
      setShowList(false);
      return;
    }

    const fetchPlaces = async () => {
      try {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/place/autocomplete/json',
          {
            params: {
              input: value,
              key: API_KEY,
              components: 'country:in',
              location: '28.6139,77.2090',
              radius: 100000,
            },
          }
        );

        if (response.data.status === 'OK') {
          setResults(response.data.predictions);
          setShowList(true);
        } else {
          setResults([]);
          setShowList(false);
        }
      } catch (err) {
        console.error('Places API error:', err);
        setResults([]);
        setShowList(false);
      }
    };

    const timeout = setTimeout(fetchPlaces, 300);
    return () => clearTimeout(timeout);
  }, [value, hasSelected]);

  const handleSelect = (place: { description: string; place_id: string }) => {
    userTyped.current = false;
    onChangeText(place.description);
    setHasSelected(true);
    setShowList(false);
    setResults([]);
    Keyboard.dismiss();
    onSelect(place);
  };

  const clearInput = () => {
    onChangeText('');
    setHasSelected(false);
    setResults([]);
    setShowList(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.inputWrapper, style]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            userTyped.current = true;
            setShowList(true);
            setHasSelected(false);
          }}
          placeholderTextColor="#888"
        />
        {value.length > 0 && (
          <TouchableOpacity style={styles.clearIcon} onPress={clearInput}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {showList && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemWrapper}
              onPress={() =>
                handleSelect({ description: item.description, place_id: item.place_id })
              }
            >
              <Text style={styles.item}>{item.description}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    paddingLeft: 6,
  },
  dropdown: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginTop: 4,
    borderRadius: 12,
    zIndex: 999,
    elevation: 6,
  },
  itemWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  item: {
    fontSize: 15,
    color: '#222',
  },
});

export default GooglePlacesInput;
