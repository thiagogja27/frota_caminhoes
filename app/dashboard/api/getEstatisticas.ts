// app/dashboard/api/getEstatisticas.ts
import { supabase } from '@/app/lib/supabase'

export const fetchEstatisticasFrota = async () => {
  const { data, error } = await supabase.rpc('get_estatisticas_frota')
  if (error) {
    console.error('Erro ao buscar estatísticas da frota:', error)
    return null
  }
  return data
}
