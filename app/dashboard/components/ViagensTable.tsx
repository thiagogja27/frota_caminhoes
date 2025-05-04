'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Spinner, Alert, Modal, Form, Row, Col, ButtonGroup } from 'react-bootstrap'
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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [viagemToDelete, setViagemToDelete] = useState<number | null>(null)
  const [editingViagem, setEditingViagem] = useState<Viagem | null>(null)
  const [formData, setFormData] = useState<Partial<Viagem>>({
    status: 'programada'
  })
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [rotas, setRotas] = useState<Rota[]>([])
  const [formLoading, setFormLoading] = useState(false)

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

  const fetchFormData = async () => {
    try {
      const { data: caminhoesData } = await supabase
        .from('caminhoes')
        .select('*')
        .or('status.eq.disponivel,status.eq.em_rota')

      const { data: motoristasData } = await supabase
        .from('motoristas')
        .select('*')
        .or('status.eq.disponivel,status.eq.em_viagem')

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

  const handleEdit = (viagem: Viagem) => {
    setEditingViagem(viagem)
    setFormData({
      ...viagem,
      data_saida: viagem.data_saida.split('+')[0], // Remove timezone para o input datetime-local
      data_chegada_estimada: viagem.data_chegada_estimada.split('+')[0],
      data_chegada_real: viagem.data_chegada_real ? viagem.data_chegada_real.split('+')[0] : null
    })
    setShowModal(true)
  }

  const handleSubmit = async () => {
    try {
      setError('')
      setFormLoading(true)
      
      if (!formData.caminhao_id || !formData.motorista_id || !formData.rota_id || 
          !formData.data_saida || !formData.data_chegada_estimada) {
        throw new Error('Preencha todos os campos obrigatórios')
      }

      if (editingViagem) {
        // Atualizar viagem existente
        const { data, error } = await supabase
          .from('viagens')
          .update({
            caminhao_id: formData.caminhao_id,
            motorista_id: formData.motorista_id,
            rota_id: formData.rota_id,
            data_saida: formData.data_saida,
            data_chegada_estimada: formData.data_chegada_estimada,
            data_chegada_real: formData.data_chegada_real,
            status: formData.status,
            carga_descricao: formData.carga_descricao,
            peso_carga: formData.peso_carga
          })
          .eq('id', editingViagem.id)
          .select()

        if (error) throw error

        setViagens(viagens.map(v => v.id === editingViagem.id ? data[0] : v))
      } else {
        // Criar nova viagem
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

        setViagens([data[0], ...viagens])
      }

      setShowModal(false)
      setFormData({ status: 'programada' })
      setEditingViagem(null)
      
      await fetchViagens()
      await fetchFormData()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar viagem')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      if (!viagemToDelete) return
      
      setFormLoading(true)
      
      const { error } = await supabase
        .from('viagens')
        .delete()
        .eq('id', viagemToDelete)

      if (error) throw error

      setViagens(viagens.filter(v => v.id !== viagemToDelete))
      setShowDeleteModal(false)
      setViagemToDelete(null)
      
      await fetchFormData()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir viagem')
    } finally {
      setFormLoading(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
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
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {viagens.map(viagem => (
            <tr key={viagem.id}>
              <td>{viagem.caminhoes?.placa || viagem.caminhao_id}</td>
              <td>{viagem.motoristas?.nome || viagem.motorista_id}</td>
              <td>{viagem.rotas?.descricao || viagem.rota_id}</td>
              <td>{formatDateTime(viagem.data_saida)}</td>
              <td>{formatDateTime(viagem.data_chegada_estimada)}</td>
              <td>{viagem.data_chegada_real ? formatDateTime(viagem.data_chegada_real) : '—'}</td>
              <td>{viagem.status}</td>
              <td>{viagem.carga_descricao || '—'}</td>
              <td>{viagem.peso_carga ?? '—'}</td>
              <td>
                <ButtonGroup size="sm">
                  <Button 
                    variant="warning" 
                    onClick={() => handleEdit(viagem)}
                    title="Editar"
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={() => {
                      setViagemToDelete(viagem.id)
                      setShowDeleteModal(true)
                    }}
                    title="Excluir"
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal de criação/edição de viagem */}
      <Modal show={showModal} onHide={() => {
        setShowModal(false)
        setEditingViagem(null)
        setFormData({ status: 'programada' })
      }} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingViagem ? 'Editar Viagem' : 'Nova Viagem'}</Modal.Title>
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

            {formData.status === 'concluida' && (
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data Real de Chegada</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      value={formData.data_chegada_real || ''}
                      onChange={(e) => setFormData({...formData, data_chegada_real: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
            )}

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
            setEditingViagem(null)
            setFormData({ status: 'programada' })
          }}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={formLoading}>
            {formLoading ? <Spinner size="sm" /> : (editingViagem ? 'Atualizar' : 'Salvar')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmação de exclusão */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Exclusão</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={formLoading}>
            {formLoading ? <Spinner size="sm" /> : 'Excluir'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}