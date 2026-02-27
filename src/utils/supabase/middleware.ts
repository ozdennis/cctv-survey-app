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

    // Shared routes that should not be prefix-rewritten on subdomains
    const isSharedRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/auth') || url.pathname.startsWith('/_next') || url.pathname.startsWith('/favicon.ico');

    // Default-Deny Routing Logic (Security Audit 3.2)
    // '/' is public ONLY on the main domain. On a subdomain, '/' is the protected dashboard.
    const isPublicRoute = (url.pathname === '/' && !subdomain) || isSharedRoute;

    // If user is not logged in and route is not public, redirect to login
    if (!user && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Rewrite URLs based on subdomains to internal Route Groups if needed
    if (subdomain && !isSharedRoute) {
        // Rewrite to the respective route group / top-level folder
        if (!url.pathname.startsWith(`/${subdomain}`)) {
            return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, request.url))
        }
    }

    return supabaseResponse
}
