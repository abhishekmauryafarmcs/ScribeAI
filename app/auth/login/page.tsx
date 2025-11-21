"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Login failed")
            }

            router.push("/dashboard")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-1/2 h-1/2 bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow delay-700"></div>
            </div>

            {/* Home Icon */}
            <Link
                href="/"
                className="absolute top-8 left-8 p-3 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all group z-20"
                title="Back to Home"
            >
                <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </Link>

            <div className="w-full max-w-md relative z-10">
                <div className="glass-card rounded-2xl p-8 border border-white/10">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2 text-glow">
                            Welcome Back
                        </h2>
                        <p className="text-white/60">Login to access your ScribeAI dashboard</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 text-red-200 rounded-lg text-sm backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-white/30 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-white/30 transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-all shadow-[0_0_15px_rgba(112,0,255,0.3)] hover:shadow-[0_0_25px_rgba(112,0,255,0.5)] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                            <span className="relative z-10">{loading ? "Logging in..." : "Login"}</span>
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-white/60">
                        Don't have an account?{" "}
                        <Link href="/auth/register" className="text-secondary hover:text-secondary-glow transition-colors font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
