import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from 'app/lib/supabaseServer'

export async function GET() {
  const supabase = createServerSupabaseClient()

  try {
    const { data, error } = await supabase
      .from('viagens')
      .select(`
        id,
        caminhao_id,
        motorista_id,
        rota_id,
        data_saida,
        data_chegada_estimada,
        data_chegada_real,
        status,
        carga_descricao,
        peso_carga,
        created_at,
        caminhoes: caminhao_id(
          placa,
          modelo,
          status
        ),
        motoristas: motorista_id(
          nome,
          cnh,
          status
        ),
        rotas: rota_id(
          origem,
          destino,
          distancia_km,
          tempo_estimado_horas
        )
      `)
      .order('data_saida', { ascending: false })

    if (error) {
      console.error('Erro Supabase:', error)
      throw new Error(`Erro ao buscar viagens: ${error.message}`)
    }

    return NextResponse.json(data || [])

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Erro na API:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}