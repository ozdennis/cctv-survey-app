import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type AppRole =
    | 'admin'
    | 'sales'
    | 'vendor'
    | 'finance'
    | 'customer_support'
    | 'customer'

const SUBDOMAIN_REQUIRED_ROLES: Record<string, AppRole[] | null> = {
    // Root domain - public landing page
    '': null,
    // Portal - login/register only (no role required to access /login or /pending)
    portal: null,
    // Specialized portals - role-gated
    sales: ['admin', 'sales'],
    vendor: ['admin', 'vendor'],
    finance: ['admin', 'finance'],
    support: ['admin', 'customer_support'],
    customer: ['admin', 'customer'],
}

function pickPrimaryRole(roles: AppRole[]): AppRole | null {
    // deterministic precedence for multi-role users
    const precedence: AppRole[] = [
        'admin',
        'sales',
        'finance',
        'customer_support',
        'vendor',
        'customer',
    ]
    for (const r of precedence) {
        if (roles.includes(r)) return r
    }
    return roles[0] ?? null
}

function detectSubdomain(hostname: string): string {
    if (!hostname) return ''
    if (
        hostname.startsWith('localhost') ||
        /^\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(hostname) ||
        hostname.endsWith('.vercel.app')
    ) {
        return ''
    }
    const parts = hostname.split('.')
    // Remove port if present
    const cleanParts = parts[parts.length - 1].includes(':')
        ? [...parts.slice(0, -1), parts[parts.length - 1].split(':')[0]]
        : parts
    if (cleanParts.length <= 2) return ''
    const sub = cleanParts[0].toLowerCase()
    // Treat 'www' as root domain, not a subdomain
    if (sub === 'www') return ''
    return sub
}

function hasRequiredRole(subdomain: string, appRole: AppRole | null): boolean {
    const required = SUBDOMAIN_REQUIRED_ROLES[subdomain]
    if (!required) return true
    if (!appRole) return false
    return required.includes(appRole)
}

function getRoleSubdomain(role: AppRole): string {
    const roleSubdomainMap: Record<AppRole, string> = {
        admin: 'portal', // Admins can access portal dashboard
        sales: 'sales',
        vendor: 'vendor',
        finance: 'finance',
        customer_support: 'support',
        customer: 'customer',
    }
    return roleSubdomainMap[role]
}

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

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const url = request.nextUrl
    const hostname = request.headers.get('host') || ''
    const subdomain = detectSubdomain(hostname)

    let appRole: AppRole | null = null
    let isActive = false
    if (user) {
        type RoleRow = { role_code: string }
        const [{ data: coreUser }, { data: roleRows }] = await Promise.all([
            supabase
                .schema('core')
                .from('users')
                .select('status')
                .eq('id', user.id)
                .maybeSingle(),
            supabase
                .schema('core')
                .from('user_roles')
                .select('role_code')
                .eq('user_id', user.id),
        ])

        isActive = (coreUser?.status as string | null | undefined) === 'active'

        const roles: AppRole[] = ((roleRows as RoleRow[] | null) || [])
            .map((r) => String(r.role_code || '').toLowerCase())
            .filter(
                (r): r is AppRole =>
                    r === 'admin' ||
                    r === 'sales' ||
                    r === 'vendor' ||
                    r === 'finance' ||
                    r === 'customer_support' ||
                    r === 'customer'
            )

        appRole = roles.length ? pickPrimaryRole(roles) : null
    }

    const isSharedRoute =
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/auth') ||
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/favicon.ico')

    const isRootDomain = !subdomain || subdomain === ''
    const isPortalSubdomain = subdomain === 'portal'

    // Root domain: always public, no auth checks
    if (isRootDomain) {
        return supabaseResponse
    }

    // Portal subdomain logic
    if (isPortalSubdomain) {
        // Allow shared routes (login, auth callbacks, static assets)
        if (isSharedRoute) {
            return supabaseResponse
        }

        // Allow access to /pending page
        if (url.pathname.startsWith('/pending')) {
            return supabaseResponse
        }

        // Not logged in? Go to login
        if (!user) {
            const loginUrl = new URL('/login', request.url)
            return NextResponse.redirect(loginUrl)
        }

        // Inactive user? Send to pending
        if (!isActive) {
            const pendingUrl = new URL('/pending', request.url)
            pendingUrl.searchParams.set('reason', 'inactive')
            return NextResponse.redirect(pendingUrl)
        }

        // No role? Send to pending (waiting for admin approval)
        if (!appRole) {
            const pendingUrl = new URL('/pending', request.url)
            pendingUrl.searchParams.set('reason', 'no_role')
            return NextResponse.redirect(pendingUrl)
        }

        // User has a role - redirect to their subdomain (except admin)
        if (appRole !== 'admin') {
            const targetSubdomain = getRoleSubdomain(appRole)
            const targetUrl = new URL(request.url)
            targetUrl.hostname = hostname.replace('portal', targetSubdomain)
            return NextResponse.redirect(targetUrl)
        }

        // Admin stays on portal
        return supabaseResponse
    }

    // Specialized subdomains (sales, vendor, finance, support, customer)
    if (subdomain && subdomain !== 'portal') {
        if (isSharedRoute) {
            return supabaseResponse
        }

        if (!user) {
            // Redirect to portal login
            const loginUrl = new URL(request.url)
            loginUrl.hostname = hostname.replace(subdomain, 'portal')
            loginUrl.pathname = '/login'
            return NextResponse.redirect(loginUrl)
        }

        if (!isActive || !appRole) {
            const pendingUrl = new URL(request.url)
            pendingUrl.hostname = hostname.replace(subdomain, 'portal')
            pendingUrl.pathname = '/pending'
            pendingUrl.searchParams.set('reason', !isActive ? 'inactive' : 'no_role')
            return NextResponse.redirect(pendingUrl)
        }

        // Check if user has required role for this subdomain
        if (!hasRequiredRole(subdomain, appRole)) {
            // Wrong subdomain - redirect to their correct one
            const correctSubdomain = getRoleSubdomain(appRole)
            const redirectUrl = new URL(request.url)
            redirectUrl.hostname = hostname.replace(subdomain, correctSubdomain)
            return NextResponse.redirect(redirectUrl)
        }

        // User has correct role - allow access
        return supabaseResponse
    }

    return supabaseResponse
}
