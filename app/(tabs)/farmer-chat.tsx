import { useLocalSearchParams } from "expo-router"
import ChatScreen from "../screens/ChatScreen"

export default function FarmerChatScreen() {
  const { farmerId, expertId } = useLocalSearchParams()

  // In a real app, you would get the current user ID from authentication
  // Here we're using the farmerId from params as the current user
  const currentUserId = farmerId as string
  const otherUserId = expertId as string

  return <ChatScreen currentUserId={currentUserId} otherUserId={otherUserId} userType="farmer" />
}
