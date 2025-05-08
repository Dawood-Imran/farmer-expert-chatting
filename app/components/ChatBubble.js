import { Image, StyleSheet, Text, View } from "react-native"

const ChatBubble = ({ message, isCurrentUser }) => {
  const { messageType, content, timestamp } = message

  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <View style={[styles.container, isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer]}>
      {messageType === "text" ? (
        <View style={[styles.textBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          <Text style={[styles.messageText, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
            {content}
          </Text>
          <Text style={[styles.timestamp, isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp]}>
            {formattedTime}
          </Text>
        </View>
      ) : messageType === "image" ? (
        <View style={[styles.mediaBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          <Image source={{ uri: `http://localhost:5000/${content}` }} style={styles.image} resizeMode="cover" />
          <Text style={[styles.timestamp, isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp]}>
            {formattedTime}
          </Text>
        </View>
      ) : (
        <View style={[styles.mediaBubble, isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble]}>
          <Text style={[styles.audioText, isCurrentUser ? styles.currentUserText : styles.otherUserText]}>
            🔊 Audio Message
          </Text>
          <Text style={[styles.timestamp, isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp]}>
            {formattedTime}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
    maxWidth: "80%",
  },
  currentUserContainer: {
    alignSelf: "flex-end",
  },
  otherUserContainer: {
    alignSelf: "flex-start",
  },
  textBubble: {
    borderRadius: 18,
    padding: 12,
    minWidth: 80,
  },
  mediaBubble: {
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 150,
  },
  currentUserBubble: {
    backgroundColor: "#4CAF50",
  },
  otherUserBubble: {
    backgroundColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  currentUserText: {
    color: "white",
  },
  otherUserText: {
    color: "#333",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  audioText: {
    padding: 12,
    fontSize: 16,
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
    alignSelf: "flex-end",
    marginTop: 2,
    marginRight: 4,
  },
  currentUserTimestamp: {
    color: "rgba(255, 255, 255, 0.8)",
  },
  otherUserTimestamp: {
    color: "rgba(0, 0, 0, 0.5)",
  },
})

export default ChatBubble
