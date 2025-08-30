import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Camera } from 'react-native-camera';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

const MoodDetector = ({ onMoodDetected }) => {
  const [model, setModel] = useState(null);
  const [currentMood, setCurrentMood] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const cameraRef = useRef(null);

  useEffect(() => {
    loadModel();
  }, []);

  const loadModel = async () => {
    try {
      // Initialize TensorFlow
      await tf.ready();
      
      // Load pre-trained emotion detection model
      const modelUrl = 'https://your-model-url/emotion-model.json';
      const loadedModel = await tf.loadLayersModel(modelUrl);
      setModel(loadedModel);
    } catch (error) {
      console.error('Error loading model:', error);
      Alert.alert('Error', 'Failed to load mood detection model');
    }
  };

  const detectMood = async (imageUri) => {
    if (!model) return;

    try {
      // Preprocess image for model input
      const response = await fetch(imageUri, {}, { isBinary: true });
      const imageData = await response.arrayBuffer();
      const imageTensor = tf.browser.fromPixels(imageData)
        .resizeNearestNeighbor([48, 48])
        .toFloat()
        .div(tf.scalar(255.0))
        .expandDims();

      // Run prediction
      const prediction = await model.predict(imageTensor).data();
      
      // Map prediction to emotions
      const emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral'];
      const maxIndex = prediction.indexOf(Math.max(...prediction));
      const detectedMood = emotions[maxIndex];
      const moodConfidence = prediction[maxIndex];

      setCurrentMood(detectedMood);
      setConfidence(moodConfidence);
      
      // Notify parent component
      onMoodDetected({
        mood: detectedMood,
        confidence: moodConfidence,
        timestamp: new Date().toISOString()
      });

      // Cleanup
      imageTensor.dispose();
    } catch (error) {
      console.error('Error detecting mood:', error);
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = { quality: 0.5, base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      detectMood(data.uri);
    }
  };

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.front}
        captureAudio={false}
      />
      
      <View style={styles.overlay}>
        <Text style={styles.moodText}>
          Current Mood: {currentMood}
        </Text>
        <Text style={styles.confidenceText}>
          Confidence: {(confidence * 100).toFixed(1)}%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 15,
    borderRadius: 10,
  },
  moodText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confidenceText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default MoodDetector;