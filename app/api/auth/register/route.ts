import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { hash } from "bcryptjs"

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json()

        // Validate input
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            )
        }

        if (password.length < 8) {
            return NextResponse.json(
                { error: "Password must be at least 8 characters" },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Hash password
        console.log("[Register] Hashing password for:", email)
        const hashedPassword = await hash(password, 10)
        console.log("[Register] Password hashed, length:", hashedPassword.length)

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                name: name || email.split("@")[0],
                emailVerified: false,
            },
        })
        console.log("[Register] User created:", user.id)

        // Create account with password
        const account = await prisma.account.create({
            data: {
                userId: user.id,
                accountId: email,
                providerId: "credential",
                password: hashedPassword,
            },
        })
        console.log("[Register] Account created, password saved:", !!account.password)

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
        console.error("[Register] Error:", error)
        return NextResponse.json(
            { error: "Failed to create account" },
            { status: 500 }
        )
    }
}
