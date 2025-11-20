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
        await fetch("/api/auth/sign-out", { method: "POST" })
        router.push("/")
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                                ScribeAI Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Manage your recording sessions
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {/* New Session Button */}
                <div className="mb-8">
                    <button
                        onClick={createNewSession}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-2xl flex items-center justify-center gap-3"
                    >
                        <svg
                            className="w-8 h-8"
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
                        Start New Session
                    </button>
                </div>

                {/* Session History */}
                <div>
                    <h2 className="text-2xl font-bold text-white mb-4">Recent Sessions</h2>
                    {loading ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                            <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto" />
                        </div>
                    ) : (
                        <SessionList sessions={sessions} />
                    )}
                </div>
            </div>
        </div>
    )
}
