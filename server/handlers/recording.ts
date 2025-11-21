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
            console.log(`[Recording] Socket ${socket.id} joining room ${sessionId}`)

            sessionBuffers.set(sessionId, [])
            activeSessions.add(sessionId)

            socket.join(sessionId) // Join room for session-specific broadcasts
            
            // Verify socket joined the room
            const rooms = Array.from(socket.rooms)
            console.log(`[Recording] Socket ${socket.id} is now in rooms:`, rooms)

            io.to(sessionId).emit("status-update", { status: "recording" })
        } catch (error) {
            console.error("[Recording] Error starting recording:", error)
            socket.emit("error", { message: "Failed to start recording" })
        }
    })

    /**
     * Handle incoming transcript chunks from browser speech recognition (microphone)
     */
    socket.on("transcript-chunk", async ({ sessionId, transcript, sequence, isFinal }) => {
        try {
            console.log(`[Recording] Received transcript chunk ${sequence} for session ${sessionId}: "${transcript.substring(0, 50)}..."`)

            if (!transcript || transcript.trim().length === 0) {
                return
            }

            // Save transcript to database (no audio data needed)
            await saveChunk(sessionId, sequence, Buffer.from(""), transcript)

            // Broadcast live transcript to all clients in this session
            io.to(sessionId).emit("transcript-update", { sequence, transcript })

            console.log(`[Recording] Saved transcript chunk ${sequence}`)
        } catch (error) {
            console.error("[Recording] Error processing transcript chunk:", error)
            socket.emit("error", { message: "Failed to process transcript chunk" })
        }
    })

    /**
     * Handle incoming audio chunks from tab share
     */
    socket.on("audio-chunk", async ({ sessionId, chunkData, sequence }) => {
        try {
            const buffer = Buffer.from(chunkData)
            console.log(`[Recording] Received audio chunk ${sequence} for session ${sessionId}, size: ${buffer.length} bytes`)

            // Skip chunks that are too small
            if (buffer.length < 1000) {
                console.log(`[Recording] Skipping chunk ${sequence} - too small (${buffer.length} bytes)`)
                return
            }

            // Check if buffer has valid WebM header
            const isValidWebM = buffer[0] === 0x1A && buffer[1] === 0x45 && 
                               buffer[2] === 0xDF && buffer[3] === 0xA3
            
            if (!isValidWebM) {
                console.log(`[Recording] Invalid WebM format for chunk ${sequence} (header: ${buffer.slice(0, 4).toString("hex")})`)
                return
            }

            // Save to database
            await saveChunk(sessionId, sequence, buffer)

            // Transcribe with Gemini
            const transcript = await transcribeAudioChunk(buffer, sequence > 0)

            // Only update and broadcast if we got a transcript
            if (transcript && transcript.trim().length > 0) {
                // Update chunk with transcript
                await updateChunkTranscript(sessionId, sequence, transcript)

                // Broadcast live transcript to all clients in this session
                io.to(sessionId).emit("transcript-update", { sequence, transcript })

                console.log(`[Recording] Transcribed audio chunk ${sequence}:`, transcript.substring(0, 50))
            } else {
                console.log(`[Recording] Audio chunk ${sequence} - no transcript`)
            }
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
    socket.on("stop-recording", async ({ sessionId, finalTranscript, duration }) => {
        try {
            console.log(`[Recording] Stopping session ${sessionId}, duration: ${duration}s`)

            io.to(sessionId).emit("status-update", { status: "processing" })
            await updateSession(sessionId, { status: "processing" })

            // Aggregate full transcript from database
            let fullTranscript = await getFullTranscript(sessionId)
            
            // If no transcript in DB, use the final transcript from client
            if (!fullTranscript || fullTranscript.trim().length === 0) {
                fullTranscript = finalTranscript || ""
            }

            // Generate AI summary using Gemini
            console.log(`[Recording] Generating summary for session ${sessionId}`)
            console.log(`[Recording] Full transcript length: ${fullTranscript.length} chars`)
            const summary = await generateSummary(fullTranscript)
            console.log(`[Recording] Summary generated, length: ${summary.length} chars`)

            // Save and broadcast completion
            await updateSession(sessionId, {
                status: "completed",
                transcript: fullTranscript,
                summary,
                duration: duration || 0,
                completedAt: new Date(),
            })

            // Get all sockets in the room
            const socketsInRoom = await io.in(sessionId).fetchSockets()
            console.log(`[Recording] Sockets in room ${sessionId}:`, socketsInRoom.map(s => s.id))
            
            console.log(`[Recording] Broadcasting session-complete to room ${sessionId}`)
            io.to(sessionId).emit("session-complete", {
                transcript: fullTranscript,
                summary,
            })
            console.log(`[Recording] Session-complete event sent with summary length: ${summary.length}`)

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
