"use client"

import { useState, useEffect, useRef } from "react"
import { useSocket } from "@/hooks/useSocket"

interface TranscriptChunk {
    sequence: number
    text: string
}

interface TranscriptViewerProps {
    sessionId: string
}

export function TranscriptViewer({ sessionId }: TranscriptViewerProps) {
    const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>([])
    const [summary, setSummary] = useState<string>("")
    const [fullTranscript, setFullTranscript] = useState<string>("")

    const socket = useSocket()
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!socket) return

        socket.on("transcript-update", ({ sequence, transcript }: TranscriptChunk) => {
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
                setFullTranscript(transcript)
                setSummary(summary)
            }
        )

        return () => {
            socket.off("transcript-update")
            socket.off("session-complete")
        }
    }, [socket])

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

    return (
        <div className="space-y-6">
            {/* Live Transcript */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                        Live Transcript
                    </h3>
                    {transcriptChunks.length > 0 && (
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
                    {transcriptChunks.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-center italic">
                            Transcript will appear here as you record...
                        </p>
                    ) : (
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
