import { NextResponse, NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const sessionToken = req.cookies.get("session")?.value

        if (sessionToken) {
            // Delete session from database
            await prisma.betterSession.deleteMany({
                where: { token: sessionToken },
            })
        }

        // Clear session cookie
        const response = NextResponse.json({ success: true })
        response.cookies.delete("session")

        return response
    } catch (error) {
        console.error("[Logout] Error:", error)
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 })
    }
}
