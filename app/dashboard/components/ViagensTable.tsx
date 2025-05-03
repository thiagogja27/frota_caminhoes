'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col } from 'react-bootstrap'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface Viagem {
  id: number
  caminhao_id: number
  motorista_id: number
  rota_id: number
  data_saida: string
  data_chegada_estimada: string
  data_chegada_real: string | null
  status: string
  carga_descricao: string | null
  peso_carga: number | null
  created_at: string
  motoristas?: { nome: string }
  caminhoes?: { placa: string }
  rotas?: { descricao: string }
}

interface Caminhao {
  id: number
  placa: string
  status: string
}

interface Motorista {
  id: number
  nome: string
  status: string
}

interface Rota {
  id: number
  descricao: string
}

export default function ViagensTable() {
  const supabase = useSupabaseClient()
  const [viagens, setViagens] = useState<Viagem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Viagem>>({
    status: 'programada'
  })
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [rotas, setRotas] = useState<Rota[]>([])
  const [formLoading, setFormLoading] = useState(false)

  // Busca viagens da API
  const fetchViagens = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/viagens')
      
      if (!response.ok) {
        throw new Error('Falha ao carregar viagens')
      }
      
      const data = await response.json()
      setViagens(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  // Busca dados para o formulário
  const fetchFormData = async () => {
    try {
      // Busca caminhões disponíveis
      const { data: caminhoesData } = await supabase
        .from('caminhoes')
        .select('*')
        .or('status.eq.disponivel,status.eq.em_rota')

      // Busca motoristas disponíveis
      const { data: motoristasData } = await supabase
        .from('motoristas')
        .select('*')
        .or('status.eq.disponivel,status.eq.em_viagem')

      // Busca rotas
      const { data: rotasData } = await supabase
        .from('rotas')
        .select('*')

      setCaminhoes(caminhoesData || [])
      setMotoristas(motoristasData || [])
      setRotas(rotasData || [])
    } catch (err) {
      console.error('Erro ao buscar dados:', err)
      setError('Erro ao carregar dados para o formulário')
    }
  }

  useEffect(() => {
    fetchViagens()
    fetchFormData()
  }, [])

  const handleSubmit = async () => {
    try {
      setError('')
      setFormLoading(true)
      
      // Validação dos campos obrigatórios
      if (!formData.caminhao_id || !formData.motorista_id || !formData.rota_id || 
          !formData.data_saida || !formData.data_chegada_estimada) {
        throw new Error('Preencha todos os campos obrigatórios')
      }

      // Verifica se o caminhão está disponível
      const caminhaoSelecionado = caminhoes.find(c => c.id === formData.caminhao_id)
      if (caminhaoSelecionado?.status !== 'disponivel') {
        throw new Error('O caminhão selecionado não está disponível')
      }

      // Verifica se o motorista está disponível
      const motoristaSelecionado = motoristas.find(m => m.id === formData.motorista_id)
      if (motoristaSelecionado?.status !== 'disponivel') {
        throw new Error('O motorista selecionado não está disponível')
      }

      // Insere a nova viagem
      const { data, error } = await supabase
        .from('viagens')
        .insert([{
          caminhao_id: formData.caminhao_id,
          motorista_id: formData.motorista_id,
          rota_id: formData.rota_id,
          data_saida: formData.data_saida,
          data_chegada_estimada: formData.data_chegada_estimada,
          status: formData.status,
          carga_descricao: formData.carga_descricao,
          peso_carga: formData.peso_carga
        }])
        .select()

      if (error) throw error

      // Atualiza status do caminhão e motorista
      await supabase
        .from('caminhoes')
        .update({ status: 'em_rota' })
        .eq('id', formData.caminhao_id)

      await supabase
        .from('motoristas')
        .update({ status: 'em_viagem' })
        .eq('id', formData.motorista_id)

      // Atualiza a lista de viagens
      setViagens([data[0], ...viagens])
      setShowModal(false)
      setFormData({ status: 'programada' })
      
      // Recarrega os dados
      await fetchViagens()
      await fetchFormData()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar viagem')
    } finally {
      setFormLoading(false)
    }
  }

  if (loading) return <Spinner animation="border" />
  if (error) return <Alert variant="danger">{error}</Alert>

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="mb-3">
        Nova Viagem
      </Button>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Caminhão</th>
            <th>Motorista</th>
            <th>Rota</th>
            <th>Saída</th>
            <th>Chegada Estimada</th>
            <th>Chegada Real</th>
            <th>Status</th>
            <th>Carga</th>
            <th>Peso (kg)</th>
          </tr>
        </thead>
        <tbody>
          {viagens.map(viagem => (
            <tr key={viagem.id}>
              <td>{viagem.caminhoes?.placa || viagem.caminhao_id}</td>
              <td>{viagem.motoristas?.nome || viagem.motorista_id}</td>
              <td>{viagem.rotas?.descricao || viagem.rota_id}</td>
              <td>{new Date(viagem.data_saida).toLocaleString()}</td>
              <td>{new Date(viagem.data_chegada_estimada).toLocaleString()}</td>
              <td>{viagem.data_chegada_real ? new Date(viagem.data_chegada_real).toLocaleString() : '—'}</td>
              <td>{viagem.status}</td>
              <td>{viagem.carga_descricao || '—'}</td>
              <td>{viagem.peso_carga ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de criação de viagem */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Nova Viagem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Caminhão *</Form.Label>
                  <Form.Select
                    value={formData.caminhao_id || ''}
                    onChange={(e) => setFormData({...formData, caminhao_id: Number(e.target.value)})}
                    required
                  >
                    <option value="">Selecione um caminhão</option>
                    {caminhoes.map(caminhao => (
                      <option key={caminhao.id} value={caminhao.id}>
                        {caminhao.placa} ({caminhao.status})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Motorista *</Form.Label>
                  <Form.Select
                    value={formData.motorista_id || ''}
                    onChange={(e) => setFormData({...formData, motorista_id: Number(e.target.value)})}
                    required
                  >
                    <option value="">Selecione um motorista</option>
                    {motoristas.map(motorista => (
                      <option key={motorista.id} value={motorista.id}>
                        {motorista.nome} ({motorista.status})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Rota *</Form.Label>
                  <Form.Select
                    value={formData.rota_id || ''}
                    onChange={(e) => setFormData({...formData, rota_id: Number(e.target.value)})}
                    required
                  >
                    <option value="">Selecione uma rota</option>
                    {rotas.map(rota => (
                      <option key={rota.id} value={rota.id}>
                        {rota.descricao || `Rota ${rota.id}`}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status *</Form.Label>
                  <Form.Select
                    value={formData.status || 'programada'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="programada">Programada</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data de Saída *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.data_saida || ''}
                    onChange={(e) => setFormData({...formData, data_saida: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Data Estimada de Chegada *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={formData.data_chegada_estimada || ''}
                    onChange={(e) => setFormData({...formData, data_chegada_estimada: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Descrição da Carga</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={formData.carga_descricao || ''}
                onChange={(e) => setFormData({...formData, carga_descricao: e.target.value})}
                placeholder="Descreva a carga a ser transportada"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Peso da Carga (kg)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                value={formData.peso_carga || ''}
                onChange={(e) => setFormData({...formData, peso_carga: Number(e.target.value)})}
                placeholder="Peso total em quilogramas"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false)
            setError('')
          }}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={formLoading}>
            {formLoading ? <Spinner size="sm" /> : 'Salvar Viagem'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}