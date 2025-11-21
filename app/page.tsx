import Link from "next/link"
import { WelcomeModal } from "@/components/ui/WelcomeModal"

export default function HomePage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
            <WelcomeModal />
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow delay-1000"></div>

            <div className="text-center space-y-8 px-4 relative z-10">
                <div className="animate-float">
                    <h1 className="text-7xl md:text-8xl font-bold tracking-tight mb-4">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                            ScribeAI
                        </span>
                    </h1>
                </div>

                <div className="glass-card p-8 rounded-2xl max-w-3xl mx-auto backdrop-blur-xl border border-white/10">
                    <p className="text-2xl md:text-3xl text-white/90 font-light mb-6">
                        AI-Powered Meeting <span className="text-secondary font-normal">Transcription</span> & <span className="text-accent font-normal">Summarization</span>
                    </p>
                    <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
                        Capture audio from your microphone or meeting tabs, get real-time transcriptions,
                        and AI-generated summaries in a seamless futuristic interface.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
                        <Link
                            href="/auth/login"
                            className="group relative px-8 py-4 bg-primary/10 border border-primary/50 text-primary-foreground rounded-lg font-semibold overflow-hidden transition-all hover:bg-primary/20 hover:border-primary"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                            <span className="relative z-10 text-white">Login</span>
                        </Link>
                        <Link
                            href="/auth/register"
                            className="group relative px-8 py-4 bg-transparent border border-white/20 text-white rounded-lg font-semibold overflow-hidden transition-all hover:bg-white/5 hover:border-white/50"
                        >
                            <span className="relative z-10">Sign Up</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer/Bottom Element */}
            <div className="absolute bottom-8 text-white/20 text-sm">
                Futuristic Audio Intelligence
            </div>
        </div>
    )
}
