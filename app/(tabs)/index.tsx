"use client"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native"

export default function TabOneScreen() {
  const router = useRouter()
  const [isConnecting, setIsConnecting] = useState(false)

  // Dummy IDs for testing
  const dummyFarmerId = "60d0fe4f5311236168a109ca"
  const dummyExpertId = "60d0fe4f5311236168a109cb"

  const navigateToFarmerChat = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
      router.push({
        pathname: "/farmer-chat",
        params: {
          farmerId: dummyFarmerId,
          expertId: dummyExpertId,
        },
      })
    }, 1000)
  }

  const navigateToExpertChat = () => {
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
      router.push({
        pathname: "/expert-chat",
        params: {
          farmerId: dummyFarmerId,
          expertId: dummyExpertId,
        },
      })
    }, 1000)
  }

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Agricultural Chat App</Text>
          <Text style={styles.subtitle}>Connect Farmers with Experts</Text>
        </View>

        <Image source={{ uri: "/uploads/images/1746679008632.jpg" }} style={styles.image} resizeMode="cover" />

        

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.farmerButton, isConnecting && styles.buttonDisabled]}
            onPress={navigateToFarmerChat}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.buttonText}>Connecting...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="leaf" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Continue as Farmer</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.expertButton, isConnecting && styles.buttonDisabled]}
            onPress={navigateToExpertChat}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.buttonText}>Connecting...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="school" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Continue as Expert</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            This platform connects farmers with agricultural experts for real-time consultation and advice. Get
            immediate help with crop issues, soil management, pest control, and more.
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 24,
  },
  featuresContainer: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  featureTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  featureDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonIcon: {
    marginRight: 8,
  },
  farmerButton: {
    backgroundColor: "#4CAF50",
  },
  expertButton: {
    backgroundColor: "#2196F3",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  infoContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 10,
    width: "100%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
})
