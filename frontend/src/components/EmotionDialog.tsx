import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native";
import { Platform, PermissionsAndroid } from "react-native";
import EmojiSelector from "react-native-emoji-selector";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Feather from 'react-native-vector-icons/Feather';


interface EmotionDialogProps {
  visible: boolean;
  onEmotionSelected: (emotion: string, isCamera: boolean) => void;
}

const EmotionDialog: React.FC<EmotionDialogProps> = ({ visible, onEmotionSelected }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoodButtons, setShowMoodButtons] = useState(false);
  const [showImageSourceModal, setShowImageSourceModal] = useState(false);

  const moodEmojis = [
    { emoji: "😮", label: "Surprise" },
    { emoji: "😢", label: "Sad" },
    { emoji: "😐", label: "Neutral" },
    { emoji: "😊", label: "Happy" },
    { emoji: "😨", label: "Fear" },
    { emoji: "🤢", label: "Disgust" },
    { emoji: "😡", label: "Angry" }
  ];

  const saveEmotion = async (emotion: string, source: string) => {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert("Error", "User not logged in");
      return;
    }
    try {
      const response = await fetch(`http://10.0.2.2:8000/users/${userId}/emotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emotion, source }),
      });
      if (!response.ok) {
        throw new Error("Failed to save emotion");
      }
    } catch (error) {
      console.error("Save Error:", error);
      Alert.alert("Error", "Failed to save emotion.");
    }
  };

  const handleMoodSelection = async (emoji: string) => {
    setShowMoodButtons(false);
    await saveEmotion(emoji, "emoji");
    onEmotionSelected(emoji, false);
  };

  const handleEmojiButtonClick = () => {
    setShowEmojiPicker(false);
    setShowMoodButtons(true);
  };
    
  const handleBack = () => {
    if (showMoodButtons) {
      setShowMoodButtons(false);
    } else if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  const handleImageSelection = async (useCamera: boolean) => {
    setShowImageSourceModal(false);
    try {
      if (Platform.OS === "android" && useCamera) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Camera Permission",
            message: "We need access to your camera to capture your emotion.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert("Permission Denied", "Camera permission is required.");
          return;
        }
      }

      const options: any = {
        mediaType: "photo",
        cameraType: "front",
        saveToPhotos: false,
      };

      const result = useCamera 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.didCancel) {
        Alert.alert("Cancelled", "You must select a photo to continue.");
        return;
      }

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        Alert.alert("Error", "No image selected. Please try again.");
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: asset.uri,
        type: asset.type || "image/jpeg",
        name: asset.fileName || "photo.jpg",
      });

      const response = await fetch("http://10.0.2.2:8000/predict/", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (response.ok && data.predictions?.length > 0) {
        const mood = data.predictions[0].mood;
        const accuracy = data.predictions[0].accuracy;
        const emotionStr = `${mood} (${accuracy}%)`;
        await saveEmotion(emotionStr, "AI");
        onEmotionSelected(emotionStr, true);
      } else {
        Alert.alert("No emotion detected", data.message || "Try again.");
      }
    } catch (error) {
      console.error("Image Error:", error);
      Alert.alert("Error", "Failed to process image.");
    }
  };

  const showImageSourceDialog = () => {
    setShowImageSourceModal(true);
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          Alert.alert("Action Required", "Please select an emotion first.");
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {(showMoodButtons || showEmojiPicker) && (
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Feather name="arrow-left" size={24} color="#1F2937" />
              </TouchableOpacity>
            )}
            
            <Text style={styles.title}>Select Your Emotion</Text>

            {!showEmojiPicker && !showMoodButtons ? (
              <>
                <TouchableOpacity style={styles.button} onPress={showImageSourceDialog}>
                  <Text style={styles.buttonText}>Upload or Capture Your Emotion</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={handleEmojiButtonClick}>
                  <Text style={styles.buttonText}>Choose emotion by Emoji</Text>
                </TouchableOpacity>
              </>
            ) : showMoodButtons ? (
              <View style={styles.moodContainer}>
                {moodEmojis.map((mood, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.moodButton}
                    onPress={() => handleMoodSelection(mood.emoji)}
                  >
                    <Text style={styles.moodText}>{mood.emoji} {mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <EmojiSelector
                onEmojiSelected={async (emoji) => {
                  setShowEmojiPicker(false);
                  await saveEmotion(emoji, "emoji");
                  onEmotionSelected(emoji, false);
                }}
                showHistory={true}
                showSearchBar={false}
                category={undefined}
              />
            )}
          </View>
        </View>
      </Modal>

      <Modal
        visible={showImageSourceModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageSourceModal(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            <Text style={styles.title}>Select Image Source</Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                setShowImageSourceModal(false);
                handleImageSelection(false);
              }}
            >
              <Text style={styles.buttonText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                setShowImageSourceModal(false);
                handleImageSelection(true);
              }}
            >
              <Text style={styles.buttonText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: '#ccc' }]} 
              onPress={() => setShowImageSourceModal(false)}
            >
              <Text style={[styles.buttonText, { color: '#333' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 15,
    padding: 10,
    zIndex: 10,
  },
  button: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 50,
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodButton: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 50,
    margin: 5,
    width: '45%',
  },
  moodText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default EmotionDialog;