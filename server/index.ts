import "dotenv/config"
import { Server } from "socket.io"
import { createServer } from "http"
import { handleRecording } from "./handlers/recording"

const httpServer = createServer()

const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.FRONTEND_URL,
].filter(Boolean)

console.log("[WebSocket] Allowed CORS origins:", allowedOrigins)

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["*"],
    },
    maxHttpBufferSize: 5e6, // 5MB per chunk
    transports: ["websocket", "polling"],
})

io.on("connection", (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`)

    // Handle recording events
    handleRecording(socket, io)

    socket.on("disconnect", (reason) => {
        console.log(`[WebSocket] Client disconnected: ${socket.id}, reason: ${reason}`)
    })

    socket.on("error", (error) => {
        console.error(`[WebSocket] Socket error:`, error)
    })
})

const PORT = process.env.SOCKET_PORT || 3001

httpServer.listen(PORT, () => {
    console.log(`🚀 WebSocket server running on http://localhost:${PORT}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing WebSocket server")
    httpServer.close(() => {
        console.log("WebSocket server closed")
        process.exit(0)
    })
})
