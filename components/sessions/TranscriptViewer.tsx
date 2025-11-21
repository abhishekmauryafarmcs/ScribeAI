"use client"

import { useState, useEffect, useRef } from "react"
import { useSocket } from "@/hooks/useSocket"

interface TranscriptChunk {
    sequence: number
    text: string
}

interface TranscriptViewerProps {
    sessionId: string
    initialTranscript?: string
    initialSummary?: string
    initialChunks?: TranscriptChunk[]
}

export function TranscriptViewer({ sessionId, initialTranscript, initialSummary, initialChunks }: TranscriptViewerProps) {
    const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>(initialChunks || [])
    const [summary, setSummary] = useState<string>(initialSummary || "")
    const [fullTranscript, setFullTranscript] = useState<string>(initialTranscript || "")
    const [loading, setLoading] = useState(true)

    const socket = useSocket()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Load session data from API if not provided
    useEffect(() => {
        const loadSessionData = async () => {
            if (initialTranscript || initialSummary || initialChunks) {
                setLoading(false)
                return
            }

            try {
                const res = await fetch(`/api/sessions/${sessionId}`)
                if (res.ok) {
                    const data = await res.json()
                    
                    if (data.transcript) {
                        setFullTranscript(data.transcript)
                    }
                    
                    if (data.summary) {
                        setSummary(data.summary)
                    }
                    
                    if (data.chunks && data.chunks.length > 0) {
                        const chunks = data.chunks.map((chunk: any) => ({
                            sequence: chunk.sequence,
                            text: chunk.transcript || ""
                        })).filter((c: TranscriptChunk) => c.text)
                        
                        setTranscriptChunks(chunks)
                    }
                }
            } catch (error) {
                console.error("Error loading session data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadSessionData()
    }, [sessionId, initialTranscript, initialSummary, initialChunks])

    useEffect(() => {
        if (!socket) {
            console.log("[TranscriptViewer] Socket not available")
            return
        }

        console.log("[TranscriptViewer] Setting up socket listeners for session:", sessionId)

        socket.on("transcript-update", ({ sequence, transcript }: { sequence: number, transcript: string }) => {
            console.log("[TranscriptViewer] Received transcript-update:", sequence, transcript.substring(0, 50))
            setTranscriptChunks((prev) => {
                // Avoid duplicates
                if (prev.some((chunk) => chunk.sequence === sequence)) {
                    return prev
                }
                return [...prev, { sequence, text: transcript }].sort(
                    (a, b) => a.sequence - b.sequence
                )
            })
        })

        socket.on(
            "session-complete",
            ({ transcript, summary }: { transcript: string; summary: string }) => {
                console.log("[TranscriptViewer] Received session-complete event")
                console.log("[TranscriptViewer] Transcript length:", transcript?.length || 0)
                console.log("[TranscriptViewer] Summary length:", summary?.length || 0)
                console.log("[TranscriptViewer] Summary preview:", summary?.substring(0, 100))
                setFullTranscript(transcript)
                setSummary(summary)
            }
        )

        return () => {
            console.log("[TranscriptViewer] Cleaning up socket listeners")
            socket.off("transcript-update")
            socket.off("session-complete")
        }
    }, [socket, sessionId])

    // Auto-scroll to latest transcript
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [transcriptChunks])

    const exportTranscript = (format: "txt" | "json") => {
        const content =
            format === "txt"
                ? fullTranscript || transcriptChunks.map((c) => c.text).join(" ")
                : JSON.stringify(
                    {
                        sessionId,
                        transcript: fullTranscript || transcriptChunks.map((c) => c.text).join(" "),
                        summary,
                        chunks: transcriptChunks,
                    },
                    null,
                    2
                )

        const blob = new Blob([content], {
            type: format === "txt" ? "text/plain" : "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `transcript-${sessionId}.${format}`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading session data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Live Transcript */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Transcript
                    </h3>
                    {(transcriptChunks.length > 0 || fullTranscript) && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportTranscript("txt")}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Export TXT
                            </button>
                            <button
                                onClick={() => exportTranscript("json")}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                                Export JSON
                            </button>
                        </div>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                    {transcriptChunks.length === 0 && !fullTranscript ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center italic">
                            Transcript will appear here as you record...
                        </p>
                    ) : transcriptChunks.length > 0 ? (
                        transcriptChunks.map((chunk) => (
                            <div
                                key={chunk.sequence}
                                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-slide-up"
                            >
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    Chunk {chunk.sequence + 1}
                                </span>
                                <p className="text-gray-800 dark:text-gray-200 mt-1">{chunk.text}</p>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{fullTranscript}</p>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>

            {/* AI Summary */}
            {summary && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="text-2xl">🤖</span>
                        AI Summary
                    </h3>
                    <div
                        className="prose prose-indigo dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, "<br/>") }}
                    />
                </div>
            )}
        </div>
    )
}
