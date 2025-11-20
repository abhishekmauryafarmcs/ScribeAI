import Link from "next/link"

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
            <div className="text-center space-y-8 px-4">
                <h1 className="text-6xl font-bold text-white drop-shadow-lg">
                    ScribeAI
                </h1>
                <p className="text-xl text-white/90 max-w-2xl">
                    AI-Powered Meeting Transcription & Summarization
                </p>
                <p className="text-lg text-white/80 max-w-xl">
                    Capture audio from your microphone or meeting tabs, get real-time transcriptions,
                    and AI-generated summaries.
                </p>

                <div className="flex gap-4 justify-center mt-8">
                    <Link
                        href="/auth/login"
                        className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Login
                    </Link>
                    <Link
                        href="/auth/register"
                        className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors shadow-lg"
                    >
                        Sign Up
                    </Link>
                </div>
            </div>
        </div>
    )
}
