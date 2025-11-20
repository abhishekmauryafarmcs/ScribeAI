import { Socket, Server } from "socket.io"
import { transcribeAudioChunk, generateSummary } from "../services/gemini"
import { saveChunk, updateSession, getFullTranscript, updateChunkTranscript } from "../services/database"

// In-memory buffer: sessionId -> array of chunks (for quick recovery)
const sessionBuffers = new Map<string, Buffer[]>()

// Track active sessions
const activeSessions = new Set<string>()

export function handleRecording(socket: Socket, io: Server) {
    /**
     * Start a new recording session
     */
    socket.on("start-recording", async ({ sessionId, userId, audioSource }) => {
        try {
            console.log(`[Recording] Starting session ${sessionId} for user ${userId}`)

            sessionBuffers.set(sessionId, [])
            activeSessions.add(sessionId)

            socket.join(sessionId) // Join room for session-specific broadcasts

            io.to(sessionId).emit("status-update", { status: "recording" })
        } catch (error) {
            console.error("[Recording] Error starting recording:", error)
            socket.emit("error", { message: "Failed to start recording" })
        }
    })

    /**
     * Handle incoming audio chunks
     */
    socket.on("audio-chunk", async ({ sessionId, chunkData, sequence }) => {
        try {
            console.log(`[Recording] Received chunk ${sequence} for session ${sessionId}`)

            const buffer = Buffer.from(chunkData)

            // Store in rolling buffer (keep last 4 chunks = 2 minutes)
            const sessionBuffer = sessionBuffers.get(sessionId) || []
            sessionBuffer.push(buffer)
            if (sessionBuffer.length > 4) {
                sessionBuffer.shift() // Remove oldest chunk
            }
            sessionBuffers.set(sessionId, sessionBuffer)

            // Save to database
            await saveChunk(sessionId, sequence, buffer)

            // Transcribe with Gemini (5s overlap with previous chunk)
            const includeContext = sequence > 0
            const transcript = await transcribeAudioChunk(buffer, includeContext)

            // Update chunk with transcript
            await updateChunkTranscript(sessionId, sequence, transcript)

            // Broadcast live transcript to all clients in this session
            io.to(sessionId).emit("transcript-update", { sequence, transcript })

            console.log(`[Recording] Transcribed chunk ${sequence}:`, transcript.substring(0, 50))
        } catch (error) {
            console.error("[Recording] Error processing audio chunk:", error)
            socket.emit("error", { message: "Failed to process audio chunk" })
        }
    })

    /**
     * Pause recording
     */
    socket.on("pause-recording", async ({ sessionId }) => {
        try {
            console.log(`[Recording] Pausing session ${sessionId}`)

            await updateSession(sessionId, { status: "paused" })
            io.to(sessionId).emit("status-update", { status: "paused" })
        } catch (error) {
            console.error("[Recording] Error pausing recording:", error)
            socket.emit("error", { message: "Failed to pause recording" })
        }
    })

    /**
     * Resume recording
     */
    socket.on("resume-recording", async ({ sessionId }) => {
        try {
            console.log(`[Recording] Resuming session ${sessionId}`)

            await updateSession(sessionId, { status: "recording" })
            io.to(sessionId).emit("status-update", { status: "recording" })
        } catch (error) {
            console.error("[Recording] Error resuming recording:", error)
            socket.emit("error", { message: "Failed to resume recording" })
        }
    })

    /**
     * Stop recording and generate summary
     */
    socket.on("stop-recording", async ({ sessionId }) => {
        try {
            console.log(`[Recording] Stopping session ${sessionId}`)

            io.to(sessionId).emit("status-update", { status: "processing" })
            await updateSession(sessionId, { status: "processing" })

            // Aggregate full transcript
            const fullTranscript = await getFullTranscript(sessionId)

            // Generate AI summary
            console.log(`[Recording] Generating summary for session ${sessionId}`)
            const summary = await generateSummary(fullTranscript)

            // Save and broadcast completion
            await updateSession(sessionId, {
                status: "completed",
                transcript: fullTranscript,
                summary,
                completedAt: new Date(),
            })

            io.to(sessionId).emit("session-complete", {
                transcript: fullTranscript,
                summary,
            })

            // Cleanup
            sessionBuffers.delete(sessionId)
            activeSessions.delete(sessionId)

            console.log(`[Recording] Session ${sessionId} completed`)
        } catch (error) {
            console.error("[Recording] Error stopping recording:", error)
            await updateSession(sessionId, { status: "error" })
            socket.emit("error", { message: "Failed to stop recording" })
        }
    })

    /**
     * Handle disconnections
     */
    socket.on("disconnect", () => {
        console.log(`[Recording] Client disconnected: ${socket.id}`)
        // Note: Don't auto-stop sessions on disconnect - allow reconnection
    })
}
