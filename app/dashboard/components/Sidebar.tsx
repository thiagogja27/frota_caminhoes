'use client'

import { Button, Nav } from 'react-bootstrap'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'
import { CSSProperties } from 'react'

interface SidebarProps {
  onNavigate: (view: string) => void
  activeView: string
}

export default function Sidebar({  onNavigate, activeView }: SidebarProps) {
  const router = useRouter()
  const supabase = useSupabaseClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) router.push('/login')
  }

  const menuItems = [
    { label: 'Dashboard', value: 'dashboard' },
    { label: 'Caminhões', value: 'caminhoes' },
    { label: 'Motoristas', value: 'motoristas' },
    { label: 'Viagens', value: 'viagens' },
    { label: 'Estatísticas', value: 'estatisticas' }
  ]

  return (
    <div style={sidebarStyle}>
      <h5 className="mb-4">Controle de Frota</h5>
      <Nav className="flex-column">
        {menuItems.map((item) => (
          <Nav.Link
            key={item.value}
            onClick={() =>  onNavigate(item.value)}
            style={
              activeView === item.value 
                ? { ...navLinkStyle, ...activeNavLinkStyle }
                : navLinkStyle
            }
            className="nav-link-hover"
          >
            {item.label}
          </Nav.Link>
        ))}
        <Button 
          variant="outline-danger" 
          className="mt-4" 
          onClick={handleSignOut} 
          style={signOutButtonStyle}
        >
          Sair
        </Button>
      </Nav>
    </div>
  )
}

// Estilos
const sidebarStyle: CSSProperties = {
  width: '250px',
  height: '100vh',
  background: '#343a40',
  padding: '1rem',
  position: 'fixed',
  color: '#fff',
  boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
}

const navLinkStyle: CSSProperties = {
  color: '#ddd',
  marginBottom: '0.5rem',
  fontSize: '1rem',
  textTransform: 'uppercase',
  padding: '10px 15px',
  borderRadius: '5px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
}

const activeNavLinkStyle: CSSProperties = {
  backgroundColor: '#495057',
  color: '#fff',
  fontWeight: 'bold',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
}

const signOutButtonStyle: CSSProperties = {
  color: '#dc3545',
  backgroundColor: 'transparent',
  border: '1px solid #dc3545',
  padding: '10px 20px',
  borderRadius: '5px',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  width: '100%',
}

