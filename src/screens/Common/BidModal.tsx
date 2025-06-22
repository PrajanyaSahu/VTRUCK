import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface BidModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (type: 'accept' | 'reject' | 'offer', bidAmount?: number) => void;
}

const BidModal: React.FC<BidModalProps> = ({ visible, onClose, onSubmit }) => {
  const [showInput, setShowInput] = useState(false);
  const [bidAmount, setBidAmount] = useState('');

  const handleOffer = () => {
    const amount = parseFloat(bidAmount);
    if (!amount || isNaN(amount)) {
      Alert.alert('Enter a valid amount');
      return;
    }
    onSubmit('offer', amount);
    setBidAmount('');
    setShowInput(false);
  };

  const handleCancelOffer = () => {
    setBidAmount('');
    setShowInput(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>What would you like to do?</Text>

          {showInput ? (
            <>
              <TouchableOpacity onPress={handleCancelOffer} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </TouchableOpacity>

              <TextInput
                placeholder="Enter your offer amount"
                placeholderTextColor="#888"
                style={styles.input}
                keyboardType="numeric"
                value={bidAmount}
                onChangeText={setBidAmount}
              />

              <TouchableOpacity style={styles.offerBtn} onPress={handleOffer}>
                <Text style={styles.offerBtnText}>Submit Offer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOffer}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.buttonColumn}>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => onSubmit('accept')}>
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.offerInitBtn} onPress={() => setShowInput(true)}>
                <Text style={styles.offerText}>Make Offer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.rejectBtn} onPress={() => { onSubmit('reject'); onClose(); }}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}

          {!showInput && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ color: '#555' }}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default BidModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 14,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonColumn: {
    width: '100%',
    gap: 12,
  },
  rejectBtn: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  acceptBtn: {
    backgroundColor: '#0047FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  offerInitBtn: {
    backgroundColor: '#6f42c1',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  offerText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  offerBtn: {
    backgroundColor: '#6f42c1',
    borderRadius: 8,
    padding: 12,
    width: '100%',
    alignItems: 'center',
  },
  offerBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 10,
  },
  cancelBtnText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 14,
  },
  closeBtn: {
    marginTop: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#007bff',
    fontWeight: '600',
    fontSize: 14,
  },
});
