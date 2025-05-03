export interface Database {
  public: {
    Tables: {
      caminhoes: {
        Row: {
          id: number
          placa: string
          modelo: string
          ano_fabricacao?: number
          status: 'ativo' | 'manutencao' | 'inativo'
          created_at: string
          dono_id?: string
        }
      }
      motoristas: {
        Row: {
          id: number
          nome: string
          cnh: string
          validade_cnh?: string
          status: 'disponivel' | 'em_viagem' | 'afastado'
          created_at: string
        }
      }
      viagens: {
        Row: {
          id: number
          origem: string
          destino: string
          caminhao_id: number
          motorista_id: number
          data_saida: string
          data_retorno?: string
          status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
          created_at: string
        }
      }
    }
  }
}