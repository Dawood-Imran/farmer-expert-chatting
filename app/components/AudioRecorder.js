"use client"

import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { useEffect, useRef, useState } from "react"
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native"

const AudioRecorder = ({ onAudioRecorded, onCancel }) => {
  const [recording, setRecording] = useState(null)
  const [recordingStatus, setRecordingStatus] = useState("idle")
  const [audioUri, setAudioUri] = useState(null)
  const [duration, setDuration] = useState(0)
  const [sound, setSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const timer = useRef(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Clean up resources when component unmounts
    return () => {
      clearInterval(timer.current)
      if (recording) {
        const currentRecording = recording
        setRecording(null)

        // Use a try-catch to prevent unloading errors
        try {
          currentRecording.stopAndUnloadAsync()
        } catch (error) {
          console.log("Recording was already stopped or unloaded",error)
        }
      }

      if (sound) {
        const currentSound = sound
        setSound(null)

        try {
          currentSound.unloadAsync()
        } catch (error) {
          console.log("Sound was already unloaded",error)
        }
      }
    }
  }, [recording, sound])

  const startRecording = async () => {
    try {
      setLoading(true)
      
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== "granted") {
        alert("Permission to access microphone is required!")
        setLoading(false)
        return
      }

      // Set audio mode with proper configuration for Android
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      // Clear any existing timer
      if (timer.current) {
        clearInterval(timer.current)
      }

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )

      setRecording(recording)
      setRecordingStatus("recording")
      setDuration(0) // Reset duration

      // Start timer
      const startTime = Date.now()
      timer.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setDuration(elapsed)
      }, 1000)
    } catch (error) {
      console.error("Failed to start recording", error)
      setLoading(false)
      Alert.alert("Error", "Failed to start recording. Please try again.")
    }
  }

  const stopRecording = async () => {
    if (!recording) return

    try {
      setRecordingStatus("stopping")

      // Clear timer
      clearInterval(timer.current)

      // Make a copy of the recording reference
      const currentRecording = recording
      // Clear the recording state first
      setRecording(null)

      // Then stop it
      await currentRecording.stopAndUnloadAsync()

      const uri = currentRecording.getURI()
      setAudioUri(uri)
      setRecordingStatus("stopped")

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      })
    } catch (error) {
      console.error("Failed to stop recording", error)
      // Even if there's an error, update the UI to reflect that we're not recording
      setRecordingStatus("idle")
    }
  }

  const playSound = async () => {
    if (!audioUri) return

    try {
      if (sound) {
        await sound.unloadAsync()
      }

      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri })
      setSound(newSound)

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false)
        }
      })

      setIsPlaying(true)
      await newSound.playAsync()
    } catch (error) {
      console.error("Failed to play sound", error)
    }
  }

  const pauseSound = async () => {
    if (!sound) return

    try {
      setIsPlaying(false)
      await sound.pauseAsync()
    } catch (error) {
      console.error("Failed to pause sound", error)
    }
  }

  const handleCancel = () => {
    if (sound) {
      try {
        sound.unloadAsync()
      } catch (error) {
        console.log("Sound was already unloaded", error)
      }
    }
    setAudioUri(null)
    setDuration(0)
    setRecordingStatus("idle")
    onCancel()
  }

  const handleSend = () => {
    onAudioRecorded({ uri: audioUri, duration })
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <View style={styles.container}>
      {recordingStatus === "idle" && (
        <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
          <Ionicons name="mic" size={24} color="#4CAF50" />
          <Text style={styles.recordText}>Record Audio Message</Text>
        </TouchableOpacity>
      )}

      {recordingStatus === "recording" && (
        <View style={styles.recordingContainer}>
          <View style={styles.recordingInfo}>
            <Ionicons name="radio" size={24} color="#F44336" />
            <Text style={styles.recordingText}>Recording... {formatTime(duration)}</Text>
          </View>
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Ionicons name="stop-circle" size={32} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {recordingStatus === "stopped" && (
        <View style={styles.previewContainer}>
          <View style={styles.audioPreview}>
            <TouchableOpacity style={styles.playButton} onPress={isPlaying ? pauseSound : playSound}>
              <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.durationText}>{formatTime(duration)}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Ionicons name="close-circle" size={24} color="white" />
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
              <Ionicons name="send" size={24} color="white" />
              <Text style={styles.buttonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  // Styles remain the same
  container: {
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    padding: 10,
  },
  recordButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E9",
    paddingVertical: 12,
    borderRadius: 8,
  },
  recordText: {
    color: "#4CAF50",
    fontWeight: "bold",
    marginLeft: 8,
  },
  recordingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFEBEE",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  recordingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  recordingText: {
    color: "#F44336",
    fontWeight: "bold",
    marginLeft: 8,
  },
  stopButton: {
    backgroundColor: "#F44336",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  previewContainer: {
    alignItems: "center",
  },
  audioPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
    width: "100%",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  durationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default AudioRecorder
