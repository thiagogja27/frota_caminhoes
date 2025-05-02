'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSessionContext } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabase'

import Sidebar from './components/Sidebar'
import MotoristasTable from './components/MotoristasTable'
import CaminhoesTable from './components/CaminhoesTable'
import ViagensTable from './components/ViagensTable'
import StatsCards from './components/StatsCards' 
import { Motorista } from './types/motorista'
import { Caminhao } from './types/caminhao'
import { Viagens } from './types/viagens'
import { fetchEstatisticasFrota } from './api/getEstatisticas'

export default function DashboardPage() {
  const router = useRouter()
  const { session, isLoading } = useSessionContext()

  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [estatisticas, setEstatisticas] = useState<any>(null)
  const [viagens, setViagens] = useState<Viagens[]>([])
  const [view, setView] = useState('dashboard') 

  useEffect(() => {
    if (!isLoading && !session) {
      router.push('/login')
    }
  }, [session, isLoading])

  useEffect(() => {
    if (session) {
      const fetchMotoristas = async () => {
        const { data } = await supabase.from('motoristas').select('*')
        if (data) setMotoristas(data)
      }

      const fetchCaminhoes = async () => {
        const { data } = await supabase.from('caminhoes').select('*')
        if (data) setCaminhoes(data)
      }

      const fetchStats = async () => {
        const stats = await fetchEstatisticasFrota()
        setEstatisticas(stats)
      }

      const fetchViagens = async () => {
        const { data } = await supabase.from('viagens').select('*')
        if (data) setViagens(data)
      }

      fetchMotoristas()
      fetchCaminhoes()
      fetchStats()
      fetchViagens()
    }
  }, [session])

  if (isLoading) return <p>Carregando...</p>
  if (!session) return null

  return (
    <div style={{ display: 'flex', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      <Sidebar onSelect={setView} />

      <div style={{ 
        marginLeft: '250px', 
        padding: '2rem', 
        width: '100%', 
        backgroundColor: '#e0e0e0', // Fundo suave
        borderRadius: '8px', // Bordas arredondadas para um visual mais elegante
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' // Sombra suave
      }}>
        <h2 style={{ color: '#333' }}>Bem-vindo, {session.user.email}</h2>

        {view === 'dashboard' && estatisticas && (
          <div className="row my-4">
            <div className="col">
              <div className="card p-3" style={{ backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <h5>Disponíveis: {estatisticas.disponiveis}</h5>
              </div>
            </div>
            <div className="col">
              <div className="card p-3" style={{ backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <h5>Em Rota: {estatisticas.em_rota}</h5>
              </div>
            </div>
            <div className="col">
              <div className="card p-3" style={{ backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <h5>Manutenção: {estatisticas.em_manutencao}</h5>
              </div>
            </div>
            <div className="col">
              <div className="card p-3 text-danger" style={{ backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>
                <h5>Atrasos: {estatisticas.atrasos}</h5>
              </div>
            </div>
          </div>
        )}

        {view === 'motoristas' && <MotoristasTable data={motoristas} />}
        {view === 'caminhoes' && <CaminhoesTable data={caminhoes} />}
        {view === 'viagens' && <ViagensTable data={viagens} />}
      </div>
    </div>
  )
}
