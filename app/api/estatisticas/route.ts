// app/api/estatisticas/route.ts (Next.js 13+/App Router)
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from 'app/lib/supabaseServer'

export async function GET() {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase.rpc('get_estatisticas_frota')
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
