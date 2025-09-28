import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ToDoSelectDialogProps {
  visible: boolean;
  onSelect: (type: 'habit' | 'task') => void;
  onClose: () => void;
}

const ToDoSelectDialog: React.FC<ToDoSelectDialogProps> = ({ visible, onSelect, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <Text style={styles.title}>Add New</Text>
          <TouchableOpacity style={styles.option} onPress={() => onSelect('habit')}>
            <Text style={styles.optionText}>Habit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => onSelect('task')}>
            <Text style={styles.optionText}>Task</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dialog: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    width: 250,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  option: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 10,
  },
  closeText: {
    color: '#EF4444',
    fontSize: 16,
  },
});

export default ToDoSelectDialog;
