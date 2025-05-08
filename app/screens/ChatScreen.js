"use client"

import { Ionicons } from "@expo/vector-icons"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import ChatBubble from "../components/ChatBubble"
import ConnectionStatus from "../components/ConnectionStatus"
import EmptyChat from "../components/EmptyChat"
import TypingIndicator from "../components/TypingIndicator"
import { emitStopTyping, emitTyping, socket } from "../utils/socket"

const ChatScreen = ({ currentUserId, otherUserId, userType }) => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState(null)
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const flatListRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Fetch previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`http://192.168.177.76:5000/api/messages/${currentUserId}/${otherUserId}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.status}`)
        }

        const data = await response.json()
        setMessages(data)
      } catch (error) {
        console.error("Error fetching messages:", error)
        setError("Failed to load messages. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [currentUserId, otherUserId])

  // Socket connection
  useEffect(() => {
    // Join the chat
    socket.emit("join", currentUserId)

    // Listen for incoming messages
    socket.on("receiveMessage", (data) => {
      if (data.senderId === otherUserId) {
        const newMessage = {
          senderId: data.senderId,
          receiverId: currentUserId,
          messageType: "text",
          content: data.message,
          timestamp: new Date(),
          _id: Date.now().toString(), // temporary id
        }

        setMessages((prevMessages) => [...prevMessages, newMessage])
        // Reset typing indicator when message is received
        setIsOtherUserTyping(false)
      }
    })

    // Listen for typing indicators
    socket.on("userTyping", (data) => {
      if (data.senderId === otherUserId && data.receiverId === currentUserId) {
        setIsOtherUserTyping(true)
      }
    })

    socket.on("userStoppedTyping", (data) => {
      if (data.senderId === otherUserId && data.receiverId === currentUserId) {
        setIsOtherUserTyping(false)
      }
    })

    return () => {
      socket.off("receiveMessage")
      socket.off("userTyping")
      socket.off("userStoppedTyping")
    }
  }, [currentUserId, otherUserId])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToEnd({ animated: true })
      }, 100)
    }
  }, [messages])

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      emitTyping({
        senderId: currentUserId,
        receiverId: otherUserId,
      })
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      emitStopTyping({
        senderId: currentUserId,
        receiverId: otherUserId,
      })
    }, 2000)
  }

  const sendMessage = async () => {
    if (inputMessage.trim() === "") return

    // Clear typing timeout and indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    setIsTyping(false)
    emitStopTyping({
      senderId: currentUserId,
      receiverId: otherUserId,
    })

    // Create new message object
    const newMessage = {
      senderId: currentUserId,
      receiverId: otherUserId,
      messageType: "text",
      content: inputMessage,
      timestamp: new Date(),
    }

    // Add to local state immediately with a temporary ID
    const tempId = Date.now().toString()
    const messageWithTempId = { ...newMessage, _id: tempId, pending: true }
    setMessages((prevMessages) => [...prevMessages, messageWithTempId])

    // Clear input
    setInputMessage("")

    // Send to server
    try {
      const response = await fetch("http://192.168.177.76:5000/api/messages/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessage),
      })

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.status}`)
      }

      const savedMessage = await response.json()

      // Update the message in state with the server-generated ID
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === tempId ? { ...savedMessage, pending: false } : msg)),
      )

      // Emit socket event
      socket.emit("sendMessage", {
        senderId: currentUserId,
        receiverId: otherUserId,
        message: inputMessage,
      })
    } catch (error) {
      console.error("Error sending message:", error)

      // Mark message as failed
      setMessages((prevMessages) =>
        prevMessages.map((msg) => (msg._id === tempId ? { ...msg, failed: true, pending: false } : msg)),
      )

      Alert.alert("Error", "Failed to send message. Tap to retry.")
    }
  }

  const retryMessage = (failedMessage) => {
    // Remove the failed message
    setMessages((prevMessages) => prevMessages.filter((msg) => msg._id !== failedMessage._id))

    // Set the content back to input
    setInputMessage(failedMessage.content)
  }

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading messages...</Text>
      </View>
    )
  }

  // Render error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{userType === "farmer" ? "Chat with Expert" : "Chat with Farmer"}</Text>
        <View style={styles.statusIndicator}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>Online</Text>
        </View>
      </View>
      <ConnectionStatus />

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => item._id || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => item.failed && retryMessage(item)} disabled={!item.failed}>
            <View style={item.failed ? styles.failedMessageContainer : null}>
              {item.failed && (
                <View style={styles.retryBadge}>
                  <Text style={styles.retryBadgeText}>Tap to retry</Text>
                </View>
              )}
              <ChatBubble message={item} isCurrentUser={item.senderId === currentUserId} />
              {item.pending && <Text style={styles.pendingText}>Sending...</Text>}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.messageList, messages.length === 0 && styles.emptyMessageList]}
        ListEmptyComponent={<EmptyChat userType={userType} />}
      />

      {isOtherUserTyping && <TypingIndicator />}

      {/* Input Area - Always visible */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={(text) => {
            setInputMessage(text)
            handleTyping()
          }}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, inputMessage.trim() === "" ? styles.sendButtonDisabled : null]}
          onPress={sendMessage}
          disabled={inputMessage.trim() === ""}
        >
          <Ionicons name="send" size={24} color={inputMessage.trim() === "" ? "#CCCCCC" : "white"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#4CAF50",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
    marginRight: 6,
  },
  statusText: {
    color: "white",
    fontSize: 14,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  emptyMessageList: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#4CAF50",
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  pendingText: {
    fontSize: 12,
    color: "#999",
    alignSelf: "flex-end",
    marginRight: 10,
    marginTop: 2,
  },
  failedMessageContainer: {
    position: "relative",
  },
  retryBadge: {
    position: "absolute",
    top: -10,
    right: 10,
    backgroundColor: "#F44336",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 1,
  },
  retryBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
})

export default ChatScreen
