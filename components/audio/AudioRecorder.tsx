"use client"

import { useState, useRef, useEffect } from "react"
import { useSocket } from "@/hooks/useSocket"

type RecordingState = "idle" | "recording" | "paused" | "processing" | "completed"

interface AudioRecorderProps {
    sessionId: string
    onComplete?: () => void
}

export function AudioRecorder({ sessionId, onComplete }: AudioRecorderProps) {
    const [state, setState] = useState<RecordingState>("idle")
    const [audioSource, setAudioSource] = useState<"microphone" | "tab">("microphone")
    const [elapsedTime, setElapsedTime] = useState(0)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const recognitionRef = useRef<any>(null)
    const sequenceRef = useRef(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const transcriptBufferRef = useRef<string>("")
    const isRecordingRef = useRef(false)

    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        console.log("[AudioRecorder] Setting up socket listeners")

        socket.on("status-update", ({ status }: { status: RecordingState }) => {
            console.log("[AudioRecorder] Status update:", status)
            setState(status)
        })

        socket.on("session-complete", () => {
            console.log("[AudioRecorder] Session complete event received")
            setState("completed")
            onComplete?.()
        })

        return () => {
            console.log("[AudioRecorder] Cleaning up socket listeners")
            socket.off("status-update")
            socket.off("session-complete")
        }
    }, [socket, onComplete])

    // Timer for elapsed time
    useEffect(() => {
        if (state === "recording") {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => prev + 1)
            }, 1000)
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [state])

    const startRecording = async () => {
        try {
            let stream: MediaStream

            if (audioSource === "microphone") {
                // Microphone recording with Web Speech API
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        sampleRate: 48000,
                    },
                })

                streamRef.current = stream

                // Initialize Web Speech API for microphone
                const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                
                if (!SpeechRecognition) {
                    alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
                    return
                }

                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = "en-US"

                recognitionRef.current = recognition

                // Handle speech recognition results
                recognition.onresult = (event: any) => {
                    let finalTranscript = ""

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + " "
                        }
                    }

                    // Send final transcript to server
                    if (finalTranscript) {
                        transcriptBufferRef.current += finalTranscript
                        socket?.emit("transcript-chunk", {
                            sessionId,
                            transcript: finalTranscript.trim(),
                            sequence: sequenceRef.current++,
                            isFinal: true,
                        })
                    }
                }

                recognition.onerror = (event: any) => {
                    console.error("Speech recognition error:", event.error)
                    if (event.error === "no-speech") {
                        // Restart recognition if no speech detected
                        if (recognitionRef.current && state === "recording") {
                            try {
                                recognition.start()
                            } catch (e) {
                                // Already started
                            }
                        }
                    }
                }

                recognition.onend = () => {
                    // Restart recognition if still recording
                    if (recognitionRef.current && state === "recording") {
                        try {
                            recognition.start()
                        } catch (e) {
                            console.error("Failed to restart recognition:", e)
                        }
                    }
                }

                // Start speech recognition
                recognition.start()
            } else {
                // Tab share recording - use Web Audio API to mix with microphone for speech recognition
                try {
                    // Get tab audio
                    const tabStream = await navigator.mediaDevices.getDisplayMedia({
                        video: true, // Required for getDisplayMedia
                        audio: {
                            echoCancellation: false,
                            noiseSuppression: false,
                            autoGainControl: false,
                        } as any,
                    })

                    // Check if audio track is present
                    const audioTracks = tabStream.getAudioTracks()
                    if (audioTracks.length === 0) {
                        alert("No audio track found. Please make sure to check 'Share tab audio' when selecting the tab.")
                        tabStream.getTracks().forEach(track => track.stop())
                        return
                    }

                    console.log("Tab audio tracks:", audioTracks.length)

                    // Stop video track (we only need audio)
                    const videoTrack = tabStream.getVideoTracks()[0]
                    if (videoTrack) {
                        videoTrack.stop()
                        tabStream.removeTrack(videoTrack)
                    }

                    streamRef.current = tabStream

                    // Create Web Audio API context to process the audio
                    const audioContext = new AudioContext()
                    const tabSource = audioContext.createMediaStreamSource(tabStream)
                    
                    // Create a destination for the processed audio
                    const destination = audioContext.createMediaStreamDestination()
                    
                    // Connect tab audio to destination
                    tabSource.connect(destination)

                    // Use Web Speech API with the processed audio
                    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
                    
                    if (!SpeechRecognition) {
                        alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.")
                        tabStream.getTracks().forEach(track => track.stop())
                        return
                    }

                    // Create a MediaRecorder that stops/starts every 30 seconds for complete WebM files
                    const startNewRecorder = () => {
                        if (!streamRef.current || !streamRef.current.active) {
                            return
                        }

                        const mediaRecorder = new MediaRecorder(streamRef.current, {
                            mimeType: "audio/webm;codecs=opus",
                            audioBitsPerSecond: 128000,
                        })

                        mediaRecorderRef.current = mediaRecorder

                        // When data is available (after stop), send it
                        mediaRecorder.ondataavailable = (event) => {
                            if (event.data.size > 0) {
                                console.log(`[Tab Audio] Sending chunk ${sequenceRef.current}, size: ${event.data.size}`)
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                    socket?.emit("audio-chunk", {
                                        sessionId,
                                        chunkData: Array.from(new Uint8Array(reader.result as ArrayBuffer)),
                                        sequence: sequenceRef.current++,
                                    })
                                }
                                reader.readAsArrayBuffer(event.data)
                            }
                        }

                        mediaRecorder.onstop = () => {
                            console.log(`[Tab Audio] Recorder stopped, isRecording: ${isRecordingRef.current}`)
                            // Start a new recorder after a brief delay if still recording
                            if (streamRef.current && streamRef.current.active && isRecordingRef.current) {
                                console.log(`[Tab Audio] Starting new recorder...`)
                                setTimeout(() => startNewRecorder(), 100)
                            }
                        }

                        mediaRecorder.onerror = (event) => {
                            console.error("MediaRecorder error:", event)
                        }

                        // Start recording - will automatically stop after 30 seconds
                        mediaRecorder.start()
                        
                        // Stop after 30 seconds to create a complete WebM file
                        setTimeout(() => {
                            if (mediaRecorder.state === "recording") {
                                mediaRecorder.stop()
                            }
                        }, 30000)
                    }

                    // Start the first recorder
                    startNewRecorder()

                } catch (err) {
                    console.error("Failed to capture tab:", err)
                    alert("Failed to capture tab audio. Please select a tab with audio and grant permission.")
                    return
                }
            }

            socket?.emit("start-recording", { sessionId, audioSource })
            setState("recording")
            setElapsedTime(0)
            transcriptBufferRef.current = ""
            isRecordingRef.current = true
        } catch (err) {
            console.error("Failed to start recording:", err)
            alert(
                "Failed to access audio source. Please grant permission and try again."
            )
        }
    }

    const pauseRecording = () => {
        isRecordingRef.current = false
        
        // Stop speech recognition (for microphone)
        recognitionRef.current?.stop()
        
        // Stop media recorder (for tab share)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
        }
        
        socket?.emit("pause-recording", { sessionId })
    }

    const resumeRecording = () => {
        try {
            isRecordingRef.current = true
            
            // Resume speech recognition (for microphone)
            if (recognitionRef.current) {
                recognitionRef.current.start()
            }
            
            socket?.emit("resume-recording", { sessionId })
        } catch (e) {
            console.error("Failed to resume recognition:", e)
        }
    }

    const stopRecording = () => {
        isRecordingRef.current = false
        
        // Stop speech recognition
        if (recognitionRef.current) {
            recognitionRef.current.stop()
            recognitionRef.current = null
        }
        
        // Stop media recorder and clear interval
        if (mediaRecorderRef.current) {
            const sendInterval = (mediaRecorderRef.current as any)?.sendInterval
            if (sendInterval) {
                clearInterval(sendInterval)
            }
            
            if (mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop()
            }
            mediaRecorderRef.current = null
        }
        
        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
        
        // Send final transcript buffer
        socket?.emit("stop-recording", { 
            sessionId,
            finalTranscript: transcriptBufferRef.current 
        })
    }

    // Auto-save on page unload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (state === "recording" || state === "paused") {
                e.preventDefault()
                stopRecording()
                return (e.returnValue = "Recording in progress. Are you sure you want to leave?")
            }
        }

        window.addEventListener("beforeunload", handleBeforeUnload)
        return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }, [state])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    Audio Recording
                </h2>
                {state !== "idle" && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Source: {audioSource === "microphone" ? "🎤 Microphone" : "🖥️ Tab Share"}
                    </p>
                )}
                <div className="text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {formatTime(elapsedTime)}
                </div>
            </div>

            {state === "idle" && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Audio Source
                        </label>
                        <select
                            value={audioSource}
                            onChange={(e) => setAudioSource(e.target.value as "microphone" | "tab")}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="microphone">🎤 Microphone</option>
                            <option value="tab">🖥️ Tab Share (Google Meet/Zoom)</option>
                        </select>
                        {audioSource === "tab" && (
                            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium mb-1">
                                    💡 Important: Tab Share Instructions
                                </p>
                                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                                    <li>Select the browser tab with audio (YouTube, Meet, Zoom, etc.)</li>
                                    <li><strong>Check "Share tab audio"</strong> in the browser dialog</li>
                                    <li>Transcription may take longer as audio is processed by AI</li>
                                </ul>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={startRecording}
                        className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <div className="w-4 h-4 bg-white rounded-full" />
                        Start Recording
                    </button>
                </div>
            )}

            {state === "recording" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-center gap-2">
                        <div className="relative">
                            <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse" />
                            <div className="absolute inset-0 w-4 h-4 bg-red-600 rounded-full recording-pulse" />
                        </div>
                        <span className="text-red-600 font-semibold">Recording...</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={pauseRecording}
                            className="flex-1 bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
                        >
                            ⏸ Pause
                        </button>
                        <button
                            onClick={stopRecording}
                            className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            ⏹ Stop
                        </button>
                    </div>
                </div>
            )}

            {state === "paused" && (
                <div className="space-y-4">
                    <div className="text-center text-yellow-600 font-semibold">⏸ Paused</div>
                    <div className="flex gap-3">
                        <button
                            onClick={resumeRecording}
                            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            ▶ Resume
                        </button>
                        <button
                            onClick={stopRecording}
                            className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                            ⏹ Stop
                        </button>
                    </div>
                </div>
            )}

            {state === "processing" && (
                <div className="text-center space-y-4">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400">Processing summary...</p>
                </div>
            )}

            {state === "completed" && (
                <div className="text-center space-y-4">
                    <div className="text-green-600 text-5xl">✓</div>
                    <p className="text-gray-800 dark:text-white font-semibold">
                        Session completed!
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        View transcript and summary below.
                    </p>
                </div>
            )}
        </div>
    )
}
