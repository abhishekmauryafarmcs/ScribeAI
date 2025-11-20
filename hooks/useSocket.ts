"use client"

import { useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

let socket: Socket | null = null

export function useSocket() {
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (!socket) {
            const serverUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:3001"

            socket = io(serverUrl, {
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
            })

            socket.on("connect", () => {
                console.log("Socket connected:", socket?.id)
                setIsConnected(true)
            })

            socket.on("disconnect", () => {
                console.log("Socket disconnected")
                setIsConnected(false)
            })

            socket.on("connect_error", (error) => {
                console.error("Socket connection error:", error)
                setIsConnected(false)
            })
        }

        return () => {
            // Don't disconnect on component unmount, keep connection alive
        }
    }, [])

    return socket
}

export function getSocket() {
    return socket
}
