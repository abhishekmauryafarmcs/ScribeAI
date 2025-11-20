"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AudioRecorder } from "@/components/audio/AudioRecorder"
import { TranscriptViewer } from "@/components/sessions/TranscriptViewer"

interface SessionData {
    id: string
    title: string
    status: string
    duration: number
    transcript: string | null
    summary: string | null
    startedAt: string
}

export default function SessionPage() {
    const params = useParams()
    const router = useRouter()
    const sessionId = params?.id as string

    const [session, setSession] = useState<SessionData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (sessionId) {
            fetchSession()
        }
    }, [sessionId])

    const fetchSession = async () => {
        try {
            const res = await fetch(`/api/sessions/${sessionId}`)
            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/auth/login")
                    return
                }
                throw new Error("Failed to fetch session")
            }
            const data = await res.json()
            setSession(data)
        } catch (error) {
            console.error("Error fetching session:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleComplete = () => {
        fetchSession() // Refresh session data
    }

    const goBack = () => {
        router.push("/dashboard")
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 text-center">
                    <p className="text-red-600 font-bold text-xl">Session not found</p>
                    <button
                        onClick={goBack}
                        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={goBack}
                        className="mb-4 px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                        {session.title}
                    </h1>
                    <p className="text-white/80 mt-2">
                        Started: {new Date(session.startedAt).toLocaleString()}
                    </p>
                </div>

                {/* Recording Interface */}
                <div className="mb-8">
                    <AudioRecorder sessionId={sessionId} onComplete={handleComplete} />
                </div>

                {/* Transcript Viewer */}
                <TranscriptViewer sessionId={sessionId} />
            </div>
        </div>
    )
}
