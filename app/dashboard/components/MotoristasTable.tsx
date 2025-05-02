'use client'
import { useState, useEffect } from 'react'
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import type { Database } from '@/app/lib/database.types'

type Motorista = Database['public']['Tables']['motoristas']['Row']

export default function MotoristasTable() {
  const supabase = useSupabaseClient<Database>()
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState<Partial<Motorista>>({})
  const [error, setError] = useState<string | null>(null)

  // Carrega os motoristas ao iniciar e após mudanças
  const fetchMotoristas = async () => {
    const { data, error } = await supabase.from('motoristas').select('*')
    if (!error) setMotoristas(data || [])
  }

  useEffect(() => {
    fetchMotoristas()
  }, [])

  const validateCNH = (cnh: string) => /^[0-9]{11}$/.test(cnh)

  const handleSubmit = async () => {
    if (!validateCNH(formData.cnh || '')) {
      setError('CNH deve ter 11 dígitos numéricos')
      return
    }

    const { error: supabaseError } = formData.id
      ? await supabase.from('motoristas').update(formData).eq('id', formData.id)
      : await supabase.from('motoristas').insert([formData])

    if (!supabaseError) {
      setShowModal(false)
      setFormData({})
      setError(null)
      fetchMotoristas() // Atualiza a tabela
    } else {
      setError(supabaseError.message)
    }
  }

  return (
    <>
      <Button onClick={() => setShowModal(true)} className="mb-3">
        Adicionar Motorista
      </Button>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CNH</th>
            <th>Validade CNH</th>
            <th>Status</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {motoristas.map((motorista) => (
            <tr key={motorista.id}>
              <td>{motorista.nome}</td>
              <td>{motorista.cnh}</td>
              <td>{motorista.validade_cnh}</td>
              <td>{motorista.status}</td>
              <td>{motorista.created_at ? new Date(motorista.created_at).toLocaleDateString() : ''}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => {
                    setFormData(motorista)
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

      <Modal show={showModal} onHide={() => {
        setShowModal(false)
        setError(null)
        setFormData({})
      }}>
        <Modal.Header closeButton>
          <Modal.Title>{formData.id ? 'Editar' : 'Novo'} Motorista</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nome</Form.Label>
              <Form.Control
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>CNH</Form.Label>
              <Form.Control
                value={formData.cnh || ''}
                onChange={(e) => setFormData({ ...formData, cnh: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Validade CNH</Form.Label>
              <Form.Control
                type="date"
                value={formData.validade_cnh || ''}
                onChange={(e) => setFormData({ ...formData, validade_cnh: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.status || ''}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="disponivel">Disponível</option>
                <option value="em_viagem">Em Viagem</option>
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
