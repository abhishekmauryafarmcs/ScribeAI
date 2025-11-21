import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

async function getAuthenticatedUser() {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session")?.value

    if (!sessionToken) {
        return null
    }

    const session = await prisma.betterSession.findUnique({
        where: { token: sessionToken },
        include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
        return null
    }

    return session.user
}

/**
 * GET /api/sessions/[id] - Get single session details
 */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthenticatedUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const sessionData = await prisma.recordingSession.findUnique({
            where: { id },
            include: {
                chunks: {
                    orderBy: { sequence: "asc" },
                    select: {
                        sequence: true,
                        transcript: true,
                        timestamp: true,
                    },
                },
            },
        })

        if (!sessionData) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 })
        }

        // Check ownership
        if (sessionData.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        return NextResponse.json(sessionData)
    } catch (error) {
        console.error("[API] Error fetching session:", error)
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
    }
}

/**
 * PATCH /api/sessions/[id] - Update session
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthenticatedUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check ownership
        const existingSession = await prisma.recordingSession.findUnique({
            where: { id },
        })

        if (!existingSession || existingSession.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const updatedSession = await prisma.recordingSession.update({
            where: { id },
            data: body,
        })

        return NextResponse.json(updatedSession)
    } catch (error) {
        console.error("[API] Error updating session:", error)
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }
}

/**
 * DELETE /api/sessions/[id] - Delete session
 */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getAuthenticatedUser()

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check ownership
        const existingSession = await prisma.recordingSession.findUnique({
            where: { id },
        })

        if (!existingSession || existingSession.userId !== user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.recordingSession.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[API] Error deleting session:", error)
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }
}
