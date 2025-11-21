import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { compare } from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json()

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                accounts: {
                    where: { providerId: "credential" },
                },
            },
        })

        if (!user || user.accounts.length === 0) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            )
        }

        // Verify password
        const account = user.accounts[0]
        if (!account.password) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            )
        }

        const isValidPassword = await compare(password, account.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            )
        }

        // Create session token
        const sessionToken = `${user.id}-${Date.now()}-${Math.random().toString(36)}`
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

        await prisma.betterSession.create({
            data: {
                userId: user.id,
                token: sessionToken,
                expiresAt,
            },
        })

        // Set session cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            },
        })

        response.cookies.set("session", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: "/",
        })

        return response
    } catch (error) {
        console.error("[Login] Error:", error)
        return NextResponse.json({ error: "Failed to login" }, { status: 500 })
    }
}
