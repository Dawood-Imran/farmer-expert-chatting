import { useLocalSearchParams } from "expo-router"
import { StyleSheet, View } from "react-native"
import ChatScreen from "../screens/ChatScreen"

export default function ExpertChatScreen() {
  const params = useLocalSearchParams()
  
  // Extract IDs and provide fallbacks
  const farmerId = typeof params.farmerId === 'string' ? params.farmerId : "60d0fe4f5311236168a109ca"
  const expertId = typeof params.expertId === 'string' ? params.expertId : "60d0fe4f5311236168a109cb"
  
  console.log("Expert Chat Screen - IDs:", { farmerId, expertId })

  return (
    <View style={styles.container}>
      <ChatScreen currentUserId={expertId} otherUserId={farmerId} userType="expert" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})
