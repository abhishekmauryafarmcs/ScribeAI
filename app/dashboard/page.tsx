"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SessionList } from "@/components/sessions/SessionList"

export default function DashboardPage() {
    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchSessions()
    }, [])

    const fetchSessions = async () => {
        try {
            const res = await fetch("/api/sessions")
            if (!res.ok) {
                if (res.status === 401) {
                    router.push("/auth/login")
                    return
                }
                throw new Error("Failed to fetch sessions")
            }
            const data = await res.json()
            setSessions(data)
        } catch (error) {
            console.error("Error fetching sessions:", error)
        } finally {
            setLoading(false)
        }
    }

    const createNewSession = async () => {
        try {
            const res = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: `Session ${new Date().toLocaleDateString()}`,
                    audioSource: "microphone",
                }),
            })

            if (!res.ok) throw new Error("Failed to create session")

            const newSession = await res.json()
            router.push(`/sessions/${newSession.id}`)
        } catch (error) {
            console.error("Error creating session:", error)
            alert("Failed to create session")
        }
    }

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" })
        router.push("/")
    }

    const handleDeleteSession = async (id: string) => {
        try {
            const res = await fetch(`/api/sessions/${id}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete session")

            // Refresh sessions list
            setSessions(sessions.filter((s: any) => s.id !== id))
        } catch (error) {
            console.error("Error deleting session:", error)
            alert("Failed to delete session")
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden p-4 md:p-8">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-20%] left-[20%] w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-secondary/10 rounded-full blur-[150px] animate-pulse-slow delay-1000"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header */}
                <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 text-glow">
                                ScribeAI Dashboard
                            </h1>
                            <p className="text-white/60">
                                Manage your recording sessions
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg font-medium hover:bg-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* New Session Button */}
                <div className="mb-8">
                    <button
                        onClick={createNewSession}
                        className="w-full bg-gradient-to-r from-primary/80 to-secondary/80 text-white py-6 rounded-2xl font-bold text-xl hover:from-primary hover:to-secondary transition-all shadow-[0_0_20px_rgba(112,0,255,0.3)] hover:shadow-[0_0_30px_rgba(112,0,255,0.5)] flex items-center justify-center gap-3 border border-white/10 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        <svg
                            className="w-8 h-8 relative z-10"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        <span className="relative z-10">Start New Session</span>
                    </button>
                </div>

                {/* Session History */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 text-glow-secondary">Recent Sessions</h2>
                    {loading ? (
                        <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                            <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto shadow-[0_0_15px_rgba(112,0,255,0.5)]" />
                        </div>
                    ) : (
                        <SessionList sessions={sessions} onDelete={handleDeleteSession} />
                    )}
                </div>
            </div>
        </div>
    )
}
