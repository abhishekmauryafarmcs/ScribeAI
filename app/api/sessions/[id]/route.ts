import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

/**
 * GET /api/sessions/[id] - Get single session details
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const sessionData = await prisma.session.findUnique({
            where: { id: params.id },
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
        if (sessionData.userId !== session.user.id) {
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
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check ownership
        const existingSession = await prisma.session.findUnique({
            where: { id: params.id },
        })

        if (!existingSession || existingSession.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const updatedSession = await prisma.session.update({
            where: { id: params.id },
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
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth.api.getSession({ headers: req.headers })

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check ownership
        const existingSession = await prisma.session.findUnique({
            where: { id: params.id },
        })

        if (!existingSession || existingSession.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.session.delete({
            where: { id: params.id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[API] Error deleting session:", error)
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }
}
