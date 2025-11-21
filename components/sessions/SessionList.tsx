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
        <div className="grid grid-cols-1 gap-6">
            {sessions.map((session, index) => (
                <div 
                    key={session.id} 
                    className="group animate-slide-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <div className="glass-card rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
                        {/* Hover gradient effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <Link href={`/sessions/${session.id}`} className="relative z-10">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0 pr-12">
                                    {/* Title */}
                                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors truncate">
                                        {session.title}
                                    </h3>
                                    
                                    {/* Metadata */}
                                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/60 mb-3">
                                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="font-medium text-white">{formatDuration(session.duration)}</span>
                                        </span>
                                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                            <svg className="w-4 h-4 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <span className="font-medium text-white">
                                                {new Date(session.startedAt).toLocaleTimeString('en-US', { 
                                                    hour: 'numeric', 
                                                    minute: '2-digit',
                                                    hour12: true 
                                                })}
                                            </span>
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 text-white font-medium">
                                            {session.audioSource === "tab" ? "🖥️ Tab Share" : "🎤 Microphone"}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="inline-flex">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(session.status)}`}>
                                            {session.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Delete Button - Absolute positioned outside content flow */}
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (confirm("Are you sure you want to delete this session?")) {
                                    onDelete(session.id)
                                }
                            }}
                            className="absolute top-6 right-6 z-20 p-2.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-500/30"
                            title="Delete Session"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
