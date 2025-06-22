// components/StateCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface StateCardProps {
  stateName: string;
  loadCount: number;
  lorryCount: number;
  imageSource: any;
}

const StateCard: React.FC<StateCardProps> = ({ stateName, loadCount, lorryCount, imageSource }) => (
  <View style={styles.card}>
    <Image source={imageSource} style={styles.map} resizeMode="contain" />
    <Text style={styles.state}>{stateName}</Text>
    <Text style={styles.text}>🌐 {loadCount} Load</Text>
    <Text style={styles.text}>🚛 {lorryCount} Lorry</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: '30%',
    margin: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 8,
    elevation: 2,
  },
  map: {
    height: 50,
    width: 60,
    marginBottom: 4,
  },
  state: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 2,
  },
  text: {
    fontSize: 12,
    color: '#555',
  },
});

export default StateCard;
