// app/lib/supabaseServer.ts
import { createClient } from '@supabase/supabase-js'

export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
