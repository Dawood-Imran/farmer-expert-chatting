"use client"

import { useEffect, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import { socket } from "../utils/socket"

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [reconnectAttempt, setReconnectAttempt] = useState(0)

  useEffect(() => {
    function onConnect() {
      setIsConnected(true)
      setReconnectAttempt(0)
    }

    function onDisconnect() {
      setIsConnected(false)
    }

    function onReconnectAttempt(attempt) {
      setReconnectAttempt(attempt)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("reconnect_attempt", onReconnectAttempt)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("reconnect_attempt", onReconnectAttempt)
    }
  }, [])

  if (isConnected) return null

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {reconnectAttempt > 0 ? `Reconnecting... (Attempt ${reconnectAttempt})` : "Connection lost. Reconnecting..."}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F44336",
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
})

export default ConnectionStatus
