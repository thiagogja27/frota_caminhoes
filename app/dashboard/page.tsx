'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionContext } from '@supabase/auth-helpers-react'
import dynamic from 'next/dynamic'
import { Alert, CircularProgress } from '@mui/material'
import { Row, Col, Card, Container } from 'react-bootstrap'

import Sidebar from './components/Sidebar'
import MotoristasTable from './components/MotoristasTable'
import CaminhoesTable from './components/CaminhoesTable'
import ViagensTable from './components/ViagensTable'

const PieChart = dynamic(() => import('@mui/x-charts').then(mod => mod.PieChart), { ssr: false })
const BarChart = dynamic(() => import('@mui/x-charts').then(mod => mod.BarChart), { ssr: false })

type Estatisticas = {
  em_rota: number
  disponiveis: number
  em_manutencao: number
  atrasos: number
  status_viagens: { status: string; quantidade: number }[]
  motoristas_ativos: number
  motoristas_inativos: number
  tipos_caminhoes: { tipo: string; quantidade: number }[]
}

export default function DashboardPage() {
  const router = useRouter()
  const { session, isLoading } = useSessionContext()

  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [view, setView] = useState('dashboard')
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !session) router.push('/login')
  }, [session, isLoading, router])

  useEffect(() => {
    if (session) {
      const fetchStats = async () => {
        try {
          setLoadingStats(true)
          const response = await fetch('/api/estatisticas')
          if (!response.ok) throw new Error('Erro ao buscar estatísticas')
          const stats = await response.json()
          setEstatisticas(stats)
        } catch (err) {
          console.error(err)
          setError('Erro ao carregar dados do dashboard.')
        } finally {
          setLoadingStats(false)
        }
      }
      fetchStats()
    }
  }, [session])

  const renderCards = () => {
    if (!estatisticas) return null

    const cards = [
      { title: 'Caminhões em Rota', value: estatisticas.em_rota, color: '#0d6efd' },
      { title: 'Caminhões Disponíveis', value: estatisticas.disponiveis, color: '#198754' },
      { title: 'Em Manutenção', value: estatisticas.em_manutencao, color: '#ffc107' },
      { title: 'Viagens Atrasadas', value: estatisticas.atrasos, color: '#dc3545' },
      { title: 'Motoristas Ativos', value: estatisticas.motoristas_ativos, color: '#20c997' },
      { title: 'Motoristas Inativos', value: estatisticas.motoristas_inativos, color: '#6c757d' }
    ]

    return (
      <Row className="mb-4">
        {cards.map((card, idx) => (
          <Col key={idx} md={4} lg={3} className="mb-3">
            <Card style={{ backgroundColor: card.color, color: '#fff' }}>
              <Card.Body>
                <Card.Title>{card.title}</Card.Title>
                <Card.Text style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {card.value}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const renderContent = () => {
    if (loadingStats) {
      return <div className="text-center mt-5"><CircularProgress /></div>
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>
    }

    switch (view) {
      case 'dashboard':
        return (
          <>
            {renderCards()}
            <Row>
              <Col md={6}>
                <h5>Status das Viagens</h5>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: estatisticas!.status_viagens.map(s => s.status) }]}
                  series={[{ data: estatisticas!.status_viagens.map(s => s.quantidade) }]}
                  width={500}
                  height={300}
                />
              </Col>
              <Col md={6}>
                <h5>Tipos de Caminhões</h5>
                <PieChart
                  series={[
                    {
                      data: estatisticas!.tipos_caminhoes.map(tipo => ({
                        id: tipo.tipo,
                        value: tipo.quantidade,
                        label: tipo.tipo
                      }))
                    }
                  ]}
                  width={500}
                  height={300}
                />
              </Col>
            </Row>
          </>
        )
      case 'caminhoes':
        return <CaminhoesTable />
      case 'motoristas':
        return <MotoristasTable />
      case 'viagens':
        return <ViagensTable />
      case 'estatisticas':
        return renderCards()
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar onNavigate={setView} activeView={view} />
      <div style={{ marginLeft: '250px', padding: '2rem', width: '100%' }}>
        <Container fluid>
          {renderContent()}
        </Container>
      </div>
    </div>
  )
}
