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
    const sequenceRef = useRef(0)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    const socket = useSocket()

    useEffect(() => {
        if (!socket) return

        socket.on("status-update", ({ status }: { status: RecordingState }) => {
            setState(status)
        })

        socket.on("session-complete", () => {
            setState("completed")
            onComplete?.()
        })

        return () => {
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
            const stream =
                audioSource === "microphone"
                    ? await navigator.mediaDevices.getUserMedia({
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            sampleRate: 48000,
                        },
                    })
                    : await navigator.mediaDevices.getDisplayMedia({
                        video: false,
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            sampleRate: 48000,
                        } as any,
                    })

            streamRef.current = stream

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: "audio/webm;codecs=opus",
                audioBitsPerSecond: 128000,
            })

            mediaRecorderRef.current = mediaRecorder

            // Send chunk every 30 seconds
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
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

            mediaRecorder.onerror = (event) => {
                console.error("MediaRecorder error:", event)
                alert("Recording error occurred")
                stopRecording()
            }

            mediaRecorder.start(30000) // 30s chunks
            socket?.emit("start-recording", { sessionId, audioSource })
            setState("recording")
            setElapsedTime(0)
        } catch (err) {
            console.error("Failed to start recording:", err)
            alert(
                "Failed to access microphone/tab. Please grant permission and try again."
            )
        }
    }

    const pauseRecording = () => {
        mediaRecorderRef.current?.pause()
        socket?.emit("pause-recording", { sessionId })
    }

    const resumeRecording = () => {
        mediaRecorderRef.current?.resume()
        socket?.emit("resume-recording", { sessionId })
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        streamRef.current?.getTracks().forEach((track) => track.stop())
        socket?.emit("stop-recording", { sessionId })
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
                            <option value="microphone">Microphone</option>
                            <option value="tab">Tab Share (Google Meet/Zoom)</option>
                        </select>
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
