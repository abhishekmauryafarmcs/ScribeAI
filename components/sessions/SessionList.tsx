import Link from "next/link"

interface Session {
    id: string
    title: string
    status: string
    duration: number
    startedAt: string
    audioSource: string
}

interface SessionListProps {
    sessions: Session[]
    onDelete: (id: string) => void
}

export function SessionList({ sessions, onDelete }: SessionListProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-500/20 text-green-200 border-green-500/50"
            case "recording":
                return "bg-red-500/20 text-red-200 border-red-500/50 animate-pulse"
            case "paused":
                return "bg-yellow-500/20 text-yellow-200 border-yellow-500/50"
            case "processing":
                return "bg-blue-500/20 text-blue-200 border-blue-500/50"
            default:
                return "bg-gray-500/20 text-gray-200 border-gray-500/50"
        }
    }

    if (sessions.length === 0) {
        return (
            <div className="glass-card rounded-2xl p-12 text-center border border-white/10">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-xl font-bold text-white mb-2">
                    No sessions yet
                </h3>
                <p className="text-white/60">
                    Start your first recording session to see it here
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {sessions.map((session) => (
                <div key={session.id} className="relative group">
                    <Link href={`/sessions/${session.id}`}>
                        <div className="glass-card rounded-xl p-6 hover:bg-white/10 transition-all cursor-pointer border border-white/5 hover:border-primary/50">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                        {session.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {formatDuration(session.duration)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {new Date(session.startedAt).toLocaleDateString()}
                                        </span>
                                        <span className="capitalize px-2 py-0.5 rounded bg-white/5 border border-white/10 text-xs">
                                            {session.audioSource === "tab" ? "Tab Share" : "Microphone"}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(session.status)}`}
                                >
                                    {session.status}
                                </span>
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (confirm("Are you sure you want to delete this session?")) {
                                onDelete(session.id)
                            }
                        }}
                        className="absolute top-4 right-4 p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Session"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    )
}
