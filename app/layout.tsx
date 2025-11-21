import type { Metadata } from "next"
import "./globals.css"
import { CursorGlow } from "@/components/ui/CursorGlow"

export const metadata: Metadata = {
    title: "ScribeAI - AI-Powered Meeting Transcription",
    description: "Real-time audio transcription for meetings with AI-powered summaries",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body className="antialiased">
                <CursorGlow />
                {children}
            </body>
        </html>
    )
}
