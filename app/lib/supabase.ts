import { createClient } from '@supabase/supabase-js'

// Obtenha as chaves de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseKey)


