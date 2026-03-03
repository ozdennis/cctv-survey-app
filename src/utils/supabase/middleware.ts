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
    // null = public / no specific role required
    '': null,
    portal: null,
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
    if (hostname.startsWith('localhost') || /^\d+\.\d+\.\d+\.\d+(:\d+)?$/.test(hostname)) {
        return ''
    }
    const parts = hostname.split('.')
    if (parts.length <= 2) return ''
    return parts[0].toLowerCase()
}

function hasRequiredRole(subdomain: string, appRole: AppRole | null): boolean {
    const required = SUBDOMAIN_REQUIRED_ROLES[subdomain]
    if (!required) return true
    if (!appRole) return false
    return required.includes(appRole)
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

    const isPortalLike = !subdomain || subdomain === 'portal'
    const isPublicRoute =
        (url.pathname === '/' && isPortalLike) ||
        isSharedRoute

    if (!user && !isPublicRoute) {
        const loginUrl = new URL('/login', request.url)
        return NextResponse.redirect(loginUrl)
    }

    // Default-deny: logged in but not active or has no roles => pending (portal-only)
    if (user && (!isActive || !appRole) && !isPublicRoute) {
        const pendingUrl = new URL('/pending', request.url)
        pendingUrl.searchParams.set('reason', !isActive ? 'inactive' : 'no_role')
        return NextResponse.redirect(pendingUrl)
    }

    if (user && !hasRequiredRole(subdomain, appRole) && !isPublicRoute) {
        const pendingUrl = new URL('/pending', request.url)
        pendingUrl.searchParams.set('reason', 'no_role')
        return NextResponse.redirect(pendingUrl)
    }

    if (subdomain && subdomain !== 'portal' && !isSharedRoute) {
        if (!url.pathname.startsWith(`/${subdomain}`)) {
            return NextResponse.rewrite(
                new URL(`/${subdomain}${url.pathname === '/' ? '' : url.pathname}`, request.url)
            )
        }
    }

    return supabaseResponse
}
