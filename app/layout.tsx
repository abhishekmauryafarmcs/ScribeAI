import type { Metadata } from "next"
import "./globals.css"

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
            <body className="antialiased">{children}</body>
        </html>
    )
}
