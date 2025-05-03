'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionContext } from '@supabase/auth-helpers-react'

import Sidebar from './components/Sidebar'
import MotoristasTable from './components/MotoristasTable'
import CaminhoesTable from './components/CaminhoesTable'
import ViagensTable from './components/ViagensTable'

export default function DashboardPage() {
  const router = useRouter()
  const { session, isLoading } = useSessionContext()

  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [view, setView] = useState('dashboard')
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login')
    }
  }, [session, isLoading])

  useEffect(() => {
    if (session) {
      const fetchStats = async () => {
        try {
          setLoadingStats(true)
          const response = await fetch('/api/estatisticas')
          if (!response.ok) {
            throw new Error('Erro ao buscar as estatísticas')
          }
          const stats = await response.json()
          setEstatisticas(stats)
        } catch (error) {
          console.error(error)
        } finally {
          setLoadingStats(false)
        }
      }

      fetchStats()
    }
  }, [session])

  if (isLoading) return <p>Carregando...</p>
  if (!session) return null

  // Função para determinar a cor do card baseado no valor
  const getCardColor = (value: number, reverse = false) => {
    if (reverse) {
      if (value === 0) return 'bg-success text-white'
      if (value < 3) return 'bg-success text-white'
      if (value < 5) return 'bg-warning text-dark'
      return 'bg-danger text-white'
    } else {
      if (value === 0) return 'bg-light text-dark'
      if (value < 3) return 'bg-success text-white'
      if (value < 5) return 'bg-warning text-dark'
      return 'bg-danger text-white'
    }
  }

  return (
    <div style={{ display: 'flex', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <Sidebar onSelect={setView} />

      <div
        style={{
          marginLeft: '250px',
          padding: '2rem',
          width: '100%',
          backgroundColor: '#e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ color: '#333' }}>Bem-vindo, {session.user.email}</h2>

        {view === 'dashboard' && (
          <>
            {loadingStats ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : estatisticas ? (
              <div className="row g-4">
                {/* Card de Caminhões em Rota */}
                <div className="col-md-6 col-lg-3">
                  <div className={`card h-100 border-0 shadow-sm ${getCardColor(estatisticas.em_rota)}`}>
                    <div className="card-body">
                      <h5 className="card-title">Caminhões em Rota</h5>
                      <p className="card-text display-5 fw-bold">{estatisticas.em_rota}</p>
                    </div>
                  </div>
                </div>

                {/* Card de Caminhões Disponíveis */}
                <div className="col-md-6 col-lg-3">
                  <div className={`card h-100 border-0 shadow-sm ${getCardColor(estatisticas.disponiveis, true)}`}>
                    <div className="card-body">
                      <h5 className="card-title">Disponíveis</h5>
                      <p className="card-text display-5 fw-bold">{estatisticas.disponiveis}</p>
                    </div>
                  </div>
                </div>

                {/* Card de Caminhões em Manutenção */}
                <div className="col-md-6 col-lg-3">
                  <div className={`card h-100 border-0 shadow-sm ${getCardColor(estatisticas.em_manutencao)}`}>
                    <div className="card-body">
                      <h5 className="card-title">Em Manutenção</h5>
                      <p className="card-text display-5 fw-bold">{estatisticas.em_manutencao}</p>
                    </div>
                  </div>
                </div>

                {/* Card de Atrasos */}
                <div className="col-md-6 col-lg-3">
                  <div className={`card h-100 border-0 shadow-sm ${getCardColor(estatisticas.atrasos)}`}>
                    <div className="card-body">
                      <h5 className="card-title">Viagens Atrasadas</h5>
                      <p className="card-text display-5 fw-bold">{estatisticas.atrasos}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center py-5">Não foi possível carregar as estatísticas</p>
            )}
          </>
        )}

        {/* Exibe as tabelas conforme a seleção de visualização */}
        {view === 'motoristas' && <MotoristasTable />}
        {view === 'caminhoes' && <CaminhoesTable />}
        {view === 'viagens' && <ViagensTable />}
      </div>
    </div>
  )
}