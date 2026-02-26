import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
    const url = req.nextUrl.clone();

    // Get the hostname from the request (works in dev and production)
    const hostname = req.headers.get('host') || '';

    // Check if the user is visiting the explicitly assigned vendor subdomain
    if (hostname.includes('vendor.pantauannusantara.com') || hostname.startsWith('vendor.localhost')) {

        // When someone goes to the vendor base URL, automatically route them to the login page
        if (url.pathname === '/') {
            url.pathname = '/login';
            return NextResponse.rewrite(url);
        }
    }

    // Continue normally for the main domain
    return NextResponse.next();
}

export const config = {
    matcher: [
        // This runs on all routes EXCEPT the static assets and APIs which don't need routing logic
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg).*)',
    ],
};
