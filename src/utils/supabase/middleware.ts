import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with cross-site tracking enabled when using explicit auth.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl
    const hostname = request.headers.get('host') || ''

    // Subdomain routing detection
    let subdomain = ''
    if (hostname.includes('finance.')) subdomain = 'finance'
    else if (hostname.includes('sales.')) subdomain = 'sales'
    else if (hostname.includes('vendor.')) subdomain = 'vendor'

    // Default-Deny Routing Logic (Security Audit 3.2)
    const isPublicRoute = url.pathname === '/' || url.pathname.startsWith('/login') || url.pathname.startsWith('/auth/callback') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/favicon.ico')

    // If user is not logged in and route is not public, redirect to login
    if (!user && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Rewrite URLs based on subdomains to internal Route Groups if needed
    // Note: For Next.js App Router, Subdomain Routing is often handled by rewriting to a specific folder.
    // E.g., finance.pantauannusantara.com/dash -> /finance/dash
    if (subdomain && !url.pathname.startsWith(`/${subdomain}`) && !isPublicRoute) {
        // Rewrite to the respective route group / top-level folder
        return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, request.url))
    }

    return supabaseResponse
}
