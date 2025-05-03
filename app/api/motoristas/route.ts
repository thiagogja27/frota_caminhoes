import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from 'app/lib/supabaseServer'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase.from('motoristas').select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
