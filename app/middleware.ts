// middleware.ts
import { NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Verifica a sessão usando o Supabase Auth
  const { data: { session } } = await supabase.auth.getSession()

  // Redireciona para o login se não autenticado e tentar acessar '/dashboard'
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redireciona para '/dashboard' se já estiver autenticado e tentar acessar '/login'
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}
