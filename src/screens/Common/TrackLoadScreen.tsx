import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';

type Location = {
  latitude: number;
  longitude: number;
};

const TrackLoadScreen = () => {
  const [currentLoc, setCurrentLoc] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  const targetLoc: Location = {
    latitude: 28.6139, // Delhi
    longitude: 77.2090,
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        setLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLoc({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          setLoading(false);
        },
        (err) => {
          console.error('Geo error:', err);
          Alert.alert('Error', 'Failed to fetch location');
          setLoading(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    };

    getLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Getting current location...</Text>
      </View>
    );
  }

  if (!currentLoc) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'red' }}>Location not available</Text>
      </View>
    );
  }

  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: currentLoc.latitude,
        longitude: currentLoc.longitude,
        latitudeDelta: 4,
        longitudeDelta: 4,
      }}
    >
      <Marker coordinate={currentLoc} title="You" pinColor="green" />
      <Marker coordinate={targetLoc} title="Delhi" pinColor="red" />
      <Polyline coordinates={[currentLoc, targetLoc]} strokeColor="blue" strokeWidth={4} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TrackLoadScreen;
