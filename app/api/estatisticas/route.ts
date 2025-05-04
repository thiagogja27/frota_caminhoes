// app/api/estatisticas/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabaseServer'

interface ViagemStatus {
  status: string
  data_chegada_estimada: string
}

export const dynamic = 'force-dynamic'
export const revalidate = 3600

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

  
    const { data: stats, error: statsError } = await supabase.rpc('get_estatisticas_frota')
    if (statsError) throw statsError

    const { data: viagens, error: viagensError } = await supabase
      .from('viagens')
      .select('status, data_chegada_estimada')

    if (viagensError) throw viagensError

 
    const viagensPorStatus = (viagens as ViagemStatus[]).reduce<Record<string, number>>(
      (acc, viagem) => {
        const status = viagem.status
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {}
    )

    return NextResponse.json({
      em_rota: stats.caminhoes_em_rota ?? 0,
      disponiveis: stats.caminhoes_disponiveis ?? 0,
      em_manutencao: stats.caminhoes_em_manutencao ?? 0,
      atrasos: stats.viagens_atrasadas ?? 0,
      status_viagens: Object.entries(viagensPorStatus).map(([status, quantidade]) => ({
        status,
        quantidade
      })),
      motoristas_ativos: stats.motoristas_ativos ?? 0,
      motoristas_inativos: stats.motoristas_inativos ?? 0,
      tipos_caminhoes: stats.tipos_caminhoes ?? [],
    })

  } catch (error: any) {
    console.error('Erro no /api/estatisticas:', error)
    return NextResponse.json(
      { error: error?.message || 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}
