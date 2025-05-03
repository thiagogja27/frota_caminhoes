// middleware.ts
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  const isLogin = req.nextUrl.pathname === '/login'

  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (user && isLogin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}
