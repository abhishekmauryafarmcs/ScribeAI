import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const sessionToken = request.cookies.get("session")?.value

    // Protect dashboard and sessions routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/sessions")) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL("/auth/login", request.url))
        }
    }

    // Redirect authenticated users away from auth pages
    if (pathname.startsWith("/auth")) {
        if (sessionToken) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/dashboard/:path*", "/sessions/:path*", "/auth/:path*"],
}
