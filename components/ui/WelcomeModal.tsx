"use client"

import { useEffect, useState } from "react"

export function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Show modal after a short delay
        const timer = setTimeout(() => {
            setIsOpen(true)
        }, 500)

        return () => clearTimeout(timer)
    }, [])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
            {/* Backdrop with blur */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-lg my-8 animate-slide-up">
                <div className="glass-card rounded-2xl p-6 md:p-8 border-2 border-primary/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                    {/* Close button */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="text-center space-y-4">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-3xl animate-float">
                                💜
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-xl md:text-2xl font-bold text-white pr-8">
                            A Heartfelt Message to{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
                                Attack Capital Team
                            </span>
                        </h2>

                        {/* Message */}
                        <div className="space-y-3 text-white/80 text-sm md:text-base leading-relaxed">
                            <p className="italic text-white/60 text-xs">
                                (I know this message popup is not part of the assignment, but I want to share something...)
                            </p>
                            
                            <p>
                                First of all, <strong className="text-secondary">Thank you so much</strong> for believing in me from such a large pool of applicants.
                            </p>
                            
                            <p>
                                I took this assignment as a <strong className="text-primary">24-hour hackathon challenge</strong> — it's now part of my habit to accept challenges and try to achieve them. Every time, I get to learn something new.
                            </p>
                            
                            <p>
                                I am <strong className="text-accent">passionate about creating real impact through technology</strong> and truly aligned with Attack Capital's mission.
                            </p>
                            
                            <p className="text-base md:text-lg font-semibold text-white pt-2">
                                Please give me a chance to contribute and grow with your visionary team. 🚀
                            </p>
                        </div>

                        {/* Signature */}
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-white/60 text-xs">
                                With gratitude and excitement,
                            </p>
                            <p className="text-white font-semibold mt-1 text-sm">
                                Abhishek Maurya
                            </p>
                        </div>

                        {/* LinkedIn button */}
                        <a
                            href="https://www.linkedin.com/in/abhishek-maurya-707106158/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsOpen(false)}
                            className="inline-block mt-4 px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-semibold hover:scale-105 transition-transform text-sm"
                        >
                            Let's Connect and Build Something Amazing! ✨
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
