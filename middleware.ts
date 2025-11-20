import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Protect dashboard and sessions routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/sessions")) {
        const session = await auth.api.getSession({ headers: request.headers })

        if (!session?.user) {
            return NextResponse.redirect(new URL("/auth/login", request.url))
        }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith("/auth")) {
        const session = await auth.api.getSession({ headers: request.headers })

        if (session?.user) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/sessions/:path*", "/auth/:path*"],
}
