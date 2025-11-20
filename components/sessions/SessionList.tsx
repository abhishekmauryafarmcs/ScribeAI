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
}

export function SessionList({ sessions }: SessionListProps) {
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}m ${secs}s`
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            case "recording":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            case "paused":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            case "processing":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
        }
    }

    if (sessions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                    No sessions yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Start your first recording session to see it here
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {sessions.map((session) => (
                <Link key={session.id} href={`/sessions/${session.id}`}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow cursor-pointer border border-transparent hover:border-indigo-500">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                    {session.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
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
                                    <span className="capitalize">
                                        {session.audioSource === "tab" ? "Tab Share" : "Microphone"}
                                    </span>
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(session.status)}`}
                            >
                                {session.status}
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    )
}
