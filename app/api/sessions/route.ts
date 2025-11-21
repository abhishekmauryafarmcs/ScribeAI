import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

/**
 * GET /api/sessions - Get all sessions for authenticated user
 */
export async function GET(req: Request) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get("session")?.value

        if (!sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify session
        const session = await prisma.betterSession.findUnique({
            where: { token: sessionToken },
            include: { user: true },
        })

        if (!session || session.expiresAt < new Date()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const sessions = await prisma.recordingSession.findMany({
            where: { userId: session.user.id },
            orderBy: { startedAt: "desc" },
            select: {
                id: true,
                title: true,
                audioSource: true,
                status: true,
                duration: true,
                startedAt: true,
                completedAt: true,
            },
        })

        return NextResponse.json(sessions)
    } catch (error) {
        console.error("[API] Error fetching sessions:", error)
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }
}

/**
 * POST /api/sessions - Create a new session
 */
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies()
        const sessionToken = cookieStore.get("session")?.value

        if (!sessionToken) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Verify session
        const session = await prisma.betterSession.findUnique({
            where: { token: sessionToken },
            include: { user: true },
        })

        if (!session || session.expiresAt < new Date()) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { title, audioSource } = body

        const newSession = await prisma.recordingSession.create({
            data: {
                userId: session.user.id,
                title: title || "Untitled Session",
                audioSource: audioSource || "microphone",
                status: "recording",
            },
        })

        return NextResponse.json(newSession)
    } catch (error) {
        console.error("[API] Error creating session:", error)
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
    }
}
