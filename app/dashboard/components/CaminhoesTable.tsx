'use client'

import { useEffect, useState } from 'react'
import { Button, Modal, Form, Table, Alert } from 'react-bootstrap'
import { supabase } from '@/lib/supabase'

type StatusCaminhao = 'disponivel' | 'em_rota' | 'em_manutencao'

interface Caminhao {
  id?: number
  placa: string
  modelo: string
  capacidade_kg: string
  status: StatusCaminhao | ''
  created_at?: string
  updated_at?: string
}

export default function CaminhoesManager() {
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [formData, setFormData] = useState<Caminhao>({ placa: '', modelo: '', capacidade_kg: '', status: '' })
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCaminhoes = async () => {
    const { data, error } = await supabase.from('caminhoes').select('*')
    if (error) {
      console.error('Erro ao buscar caminhões:', error)
    } else {
      setCaminhoes(data)
    }
  }

  useEffect(() => {
    fetchCaminhoes()
  }, [])

  const handleSubmit = async () => {
    if (!formData.placa || !formData.modelo || !formData.status) {
      setError('Placa, modelo e status são obrigatórios')
      return
    }

    let result
    if (formData.id) {
      result = await supabase
        .from('caminhoes')
        .update({ ...formData, updated_at: new Date().toISOString() })
        .eq('id', formData.id)
    } else {
      result = await supabase.from('caminhoes').insert({ ...formData })
    }

    if (result.error) {
      setError(result.error.message)
    } else {
      setShowModal(false)
      setFormData({ placa: '', modelo: '', capacidade_kg: '', status: '' })
      setError(null)
      fetchCaminhoes()
    }
  }

  return (
    <>
      <Button onClick={() => { setFormData({ placa: '', modelo: '', capacidade_kg: '', status: '' }); setShowModal(true) }} className="mb-3">
        Adicionar Caminhão
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Placa</th>
            <th>Modelo</th>
            <th>Capacidade (kg)</th>
            <th>Status</th>
            <th>Criado em</th>
            <th>Atualizado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {caminhoes.map((c) => (
            <tr key={c.id}>
              <td>{c.placa}</td>
              <td>{c.modelo}</td>
              <td>{c.capacidade_kg}</td>
              <td>{c.status}</td>
              <td>{c.created_at ? new Date(c.created_at).toLocaleString() : '-'}</td>
              <td>{c.updated_at ? new Date(c.updated_at).toLocaleString() : '-'}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    setFormData(c)
                    setShowModal(true)
                  }}
                >
                  Editar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? 'Editar Caminhão' : 'Novo Caminhão'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="formPlaca">
              <Form.Label>Placa</Form.Label>
              <Form.Control
                type="text"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formModelo">
              <Form.Label>Modelo</Form.Label>
              <Form.Control
                type="text"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formCapacidade">
              <Form.Label>Capacidade (kg)</Form.Label>
              <Form.Control
                type="text"
                value={formData.capacidade_kg}
                onChange={(e) => setFormData({ ...formData, capacidade_kg: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStatus">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as StatusCaminhao,
                  })
                }
              >
                <option value="">Selecione o status</option>
                <option value="disponivel">Disponível</option>
                <option value="em_rota">Em Rota</option>
                <option value="em_manutencao">Em Manutenção</option>
              </Form.Select>
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
