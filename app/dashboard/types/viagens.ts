export interface Viagens {
  id: number
  origem: string
  destino: string
  motorista_id: number
  caminhao_id: number
  data_saida: string // ISO string ou Date
  data_chegada_estimada: string
  data_chegada_real?: string
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada'
  carga?: string
  observacoes?: string
  created_at?: string
  updated_at?: string
}
