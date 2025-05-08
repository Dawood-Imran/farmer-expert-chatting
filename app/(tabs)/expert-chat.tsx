import { useLocalSearchParams } from "expo-router"
import ChatScreen from "../screens/ChatScreen"

export default function ExpertChatScreen() {
  const { farmerId, expertId } = useLocalSearchParams()

  // In a real app, you would get the current user ID from authentication
  // Here we're using the expertId from params as the current user
  const currentUserId = expertId as string
  const otherUserId = farmerId as string

  return <ChatScreen currentUserId={currentUserId} otherUserId={otherUserId} userType="expert" />
}
