'use client'

import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
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
}

interface Motorista {
  id: number
  nome: string
  status: string
}

interface Caminhao {
  id: number
  placa: string
  status: string
}

export default function ViagensTable({ data }: { data: Viagem[] }) {
  const supabase = useSupabaseClient()
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Viagem>>({})
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const { data: motoristasData } = await supabase
        .from('motoristas')
        .select('*')
        .eq('status', 'disponivel')
      setMotoristas(motoristasData || [])

      const { data: caminhoesData } = await supabase
        .from('caminhoes')
        .select('*')
        .eq('status', 'disponivel')
      setCaminhoes(caminhoesData || [])
    }

    fetchData()
  }, [supabase])

  const handleSubmit = async () => {
    setErrorMessage('')

    if (
      !formData.motorista_id ||
      !formData.caminhao_id ||
      !formData.data_saida ||
      !formData.data_chegada_estimada
    ) {
      setErrorMessage('Preencha todos os campos obrigatórios.')
      return
    }

    const { data: motoristaData } = await supabase
      .from('motoristas')
      .select('status')
      .eq('id', formData.motorista_id)
      .single()

    if (motoristaData?.status !== 'disponivel') {
      setErrorMessage('Motorista não está disponível.')
      return
    }

    const { data: caminhaoData } = await supabase
      .from('caminhoes')
      .select('status')
      .eq('id', formData.caminhao_id)
      .single()

    if (caminhaoData?.status !== 'disponivel') {
      setErrorMessage('Caminhão não está disponível.')
      return
    }

    const { error } = await supabase.from('viagens').insert([
      {
        caminhao_id: formData.caminhao_id,
        motorista_id: formData.motorista_id,
        rota_id: formData.rota_id,
        data_saida: formData.data_saida,
        data_chegada_estimada: formData.data_chegada_estimada,
        data_chegada_real: formData.data_chegada_real,
        status: formData.status || 'em_andamento',
        carga_descricao: formData.carga_descricao,
        peso_carga: formData.peso_carga,
      },
    ])

    if (error) {
      setErrorMessage('Erro ao salvar a viagem.')
      return
    }

    // Atualiza status do motorista e caminhão
    await supabase
      .from('motoristas')
      .update({ status: 'em_viagem' })
      .eq('id', formData.motorista_id)

    await supabase
      .from('caminhoes')
      .update({ status: 'em_rota' })
      .eq('id', formData.caminhao_id)

    setShowModal(false)
    setFormData({})
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="mb-3">
        Adicionar Viagem
      </Button>

      <Table striped bordered hover>
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
          {data.map((viagem) => (
            <tr key={viagem.id}>
              <td>{viagem.caminhao_id}</td>
              <td>{viagem.motorista_id}</td>
              <td>{viagem.rota_id}</td>
              <td>{viagem.data_saida}</td>
              <td>{viagem.data_chegada_estimada}</td>
              <td>{viagem.data_chegada_real || '—'}</td>
              <td>{viagem.status}</td>
              <td>{viagem.carga_descricao || '—'}</td>
              <td>{viagem.peso_carga ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false)
          setFormData({})
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Nova Viagem</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Motorista</Form.Label>
              <Form.Select
                value={formData.motorista_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, motorista_id: parseInt(e.target.value) })
                }
              >
                <option value="">Selecione um motorista</option>
                {motoristas.map((motorista) => (
                  <option key={motorista.id} value={motorista.id}>
                    {motorista.nome}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Caminhão</Form.Label>
              <Form.Select
                value={formData.caminhao_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, caminhao_id: parseInt(e.target.value) })
                }
              >
                <option value="">Selecione um caminhão</option>
                {caminhoes.map((caminhao) => (
                  <option key={caminhao.id} value={caminhao.id}>
                    {caminhao.placa}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rota ID</Form.Label>
              <Form.Control
                type="number"
                value={formData.rota_id || ''}
                onChange={(e) =>
                  setFormData({ ...formData, rota_id: parseInt(e.target.value) })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Data Saída</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.data_saida || ''}
                onChange={(e) => setFormData({ ...formData, data_saida: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Chegada Estimada</Form.Label>
              <Form.Control
                type="datetime-local"
                value={formData.data_chegada_estimada || ''}
                onChange={(e) =>
                  setFormData({ ...formData, data_chegada_estimada: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descrição da Carga</Form.Label>
              <Form.Control
                type="text"
                value={formData.carga_descricao || ''}
                onChange={(e) =>
                  setFormData({ ...formData, carga_descricao: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Peso da Carga (kg)</Form.Label>
              <Form.Control
                type="number"
                value={formData.peso_carga || ''}
                onChange={(e) =>
                  setFormData({ ...formData, peso_carga: parseFloat(e.target.value) })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}
