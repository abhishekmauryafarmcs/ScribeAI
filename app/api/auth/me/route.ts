import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const sessionToken = req.cookies.get("session")?.value

        if (!sessionToken) {
            return NextResponse.json({ user: null })
        }

        // Find session
        const session = await prisma.betterSession.findUnique({
            where: { token: sessionToken },
        })

        if (!session || session.expiresAt < new Date()) {
            return NextResponse.json({ user: null })
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                email: true,
                name: true,
                image: true,
            },
        })

        return NextResponse.json({ user })
    } catch (error) {
        console.error("[Me] Error:", error)
        return NextResponse.json({ user: null })
    }
}
