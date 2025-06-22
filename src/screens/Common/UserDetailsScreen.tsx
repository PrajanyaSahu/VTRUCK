// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
// } from 'react-native';
// import { RouteProp } from '@react-navigation/native';
// import { RootStackParamList } from '../../navigation/AppNavigator';

// type UserDetailsRouteProp = RouteProp<RootStackParamList, 'UserDetails'>;

// type Props = {
//   route: UserDetailsRouteProp;
//   navigation: any;
// };

// const UserDetailsScreen: React.FC<Props> = ({ navigation, route }) => {
//   const { userId, userType } = route.params;

//   const [name, setName] = useState('');
//   const [company, setCompany] = useState('');

//   const handleContinue = async () => {
//     if (!name.trim()) {
//       Alert.alert('Validation Error', 'Please enter your name');
//       return;
//     }

//     try {
//       await firestore()
//         .collection('users')
//         .doc(userId)
//         .set(
//           {
//             name,
//             company,
//             type: userType,
//             createdAt: firestore.FieldValue.serverTimestamp(),
//           },
//           { merge: true }
//         );

//       if (userType === 'driver') {
//         navigation.replace('DriverHome');
//       } else {
//         navigation.replace('ShipperHome');
//       }
//     } catch (error: unknown) {
//       const errorMessage =
//         error instanceof Error ? error.message : 'Something went wrong';
//       Alert.alert('Error', 'Failed to save data: ' + errorMessage);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Please provide your details.</Text>
//       <Text style={styles.subtitle}>
//         By providing complete and accurate information, you will gain the trust
//         of shippers.
//       </Text>

//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Your Name</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your full name"
//           placeholderTextColor="#999"
//           value={name}
//           onChangeText={setName}
//         />
//       </View>

//       <View style={styles.inputGroup}>
//         <Text style={styles.label}>Company Name (optional)</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter your company name"
//           placeholderTextColor="#999"
//           value={company}
//           onChangeText={setCompany}
//         />
//       </View>

//       <TouchableOpacity style={styles.button} onPress={handleContinue}>
//         <Text style={styles.buttonText}>CONTINUE</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default UserDetailsScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 24,
//     backgroundColor: '#fff',
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 6,
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#888',
//     marginBottom: 20,
//   },
//   inputGroup: {
//     marginBottom: 16,
//   },
//   label: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#444',
//     marginBottom: 6,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     color: '#000',
//   },
//   button: {
//     backgroundColor: '#009FFD',
//     paddingVertical: 14,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginTop: 16,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });
