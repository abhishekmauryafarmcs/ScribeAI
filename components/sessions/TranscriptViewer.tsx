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

    // Load session data from API
    useEffect(() => {
        const loadSessionData = async () => {
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

                    // Always load chunks from database
                    if (data.chunks && data.chunks.length > 0) {
                        const chunks = data.chunks.map((chunk: any) => ({
                            sequence: chunk.sequence,
                            text: chunk.transcript || ""
                        })).filter((c: TranscriptChunk) => c.text)

                        setTranscriptChunks(chunks)
                        console.log("[TranscriptViewer] Loaded chunks:", chunks.length)
                    }
                }
            } catch (error) {
                console.error("Error loading session data:", error)
            } finally {
                setLoading(false)
            }
        }

        loadSessionData()
    }, [sessionId])

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
                <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-white/60 mt-4">Loading session data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* AI Summary - Show first */}
            {summary && (
                <div className="glass-card rounded-2xl p-8 border border-accent/30">
                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-3xl">🤖</span>
                        ScribeAI Summary
                    </h3>
                    <div className="prose prose-invert max-w-none prose-p:text-white/80 prose-headings:text-white prose-strong:text-secondary prose-li:text-white/80 prose-h2:text-xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-6 prose-ul:list-disc prose-ul:ml-6">
                        {summary.split('\n').map((line, index) => {
                            // Handle markdown headers
                            if (line.startsWith('## ')) {
                                return <h2 key={index} className="text-xl font-bold text-white mb-3 mt-6">{line.replace('## ', '')}</h2>
                            }
                            // Handle list items
                            if (line.trim().startsWith('- ')) {
                                return <li key={index} className="text-white/80 ml-6">{line.replace(/^- /, '')}</li>
                            }
                            // Handle bold text
                            if (line.includes('**')) {
                                const parts = line.split('**')
                                return (
                                    <p key={index} className="text-white/80 mb-2">
                                        {parts.map((part, i) => 
                                            i % 2 === 1 ? <strong key={i} className="text-secondary font-semibold">{part}</strong> : part
                                        )}
                                    </p>
                                )
                            }
                            // Regular paragraph
                            if (line.trim()) {
                                return <p key={index} className="text-white/80 mb-2">{line}</p>
                            }
                            return null
                        })}
                    </div>
                </div>
            )}

            {/* Transcript - Show second */}
            <div className="glass-card rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">
                        Transcript
                    </h3>
                    {(transcriptChunks.length > 0 || fullTranscript) && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportTranscript("txt")}
                                className="px-4 py-2 bg-primary/20 border border-primary/50 text-white rounded-lg text-sm font-medium hover:bg-primary/30 transition-all"
                            >
                                Export TXT
                            </button>
                            <button
                                onClick={() => exportTranscript("json")}
                                className="px-4 py-2 bg-secondary/20 border border-secondary/50 text-white rounded-lg text-sm font-medium hover:bg-secondary/30 transition-all"
                            >
                                Export JSON
                            </button>
                        </div>
                    )}
                </div>

                <div className="max-h-96 overflow-y-auto space-y-3 bg-black/20 rounded-lg p-4 border border-white/5 custom-scrollbar">
                    {transcriptChunks.length === 0 && !fullTranscript ? (
                        <p className="text-white/40 text-center italic">
                            Transcript will appear here as you record...
                        </p>
                    ) : (
                        transcriptChunks.map((chunk) => (
                            <div
                                key={chunk.sequence}
                                className="p-3 bg-white/5 rounded-lg border border-white/10 animate-slide-up hover:bg-white/10 transition-colors"
                            >
                                <span className="text-xs text-primary font-mono mb-1 block">
                                    CHUNK_{String(chunk.sequence + 1).padStart(3, '0')}
                                </span>
                                <p className="text-white/90 leading-relaxed">{chunk.text}</p>
                            </div>
                        ))
                    )}
                    <div ref={scrollRef} />
                </div>
            </div>
        </div>
    )
}
