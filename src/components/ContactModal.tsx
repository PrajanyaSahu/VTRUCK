import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

interface Contact {
  name: string;
  phone: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  contact: Contact;
  setContact: React.Dispatch<React.SetStateAction<Contact>>;
}

const ContactModal: React.FC<Props> = ({ visible, onClose, title, contact, setContact }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Name"
              placeholderTextColor="#888"
              value={contact.name}
              onChangeText={(text) =>
                setContact((prev) => ({ ...prev, name: text }))
              }
            />

            <TextInput
              style={styles.textInput}
              placeholder="Phone"
              placeholderTextColor="#888"
              keyboardType="phone-pad"
              value={contact.phone}
              onChangeText={(text) =>
                setContact((prev) => ({ ...prev, phone: text }))
              }
            />

            <TouchableOpacity style={styles.modalButton} onPress={onClose}>
              <Text style={styles.modalButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ContactModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    width: '100%',
  },
  modalButton: {
    marginTop: 10,
    backgroundColor: '#009FFD',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
