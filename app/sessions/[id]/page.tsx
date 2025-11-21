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
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div className="glass-card rounded-2xl shadow-2xl p-12 border border-white/10">
                    <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                </div>
            </div>
        )
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div className="glass-card rounded-2xl shadow-2xl p-12 text-center border border-white/10">
                    <p className="text-red-400 font-bold text-xl">Session not found</p>
                    <button
                        onClick={goBack}
                        className="mt-4 px-6 py-2 bg-primary/20 border border-primary/50 text-white rounded-lg font-medium hover:bg-primary/30 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen relative overflow-hidden p-4 md:p-8">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] right-[20%] w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-accent/10 rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={goBack}
                        className="mb-4 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center gap-2 group"
                    >
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                            />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        {session.title}
                    </h1>
                    <p className="text-white/60 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
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
