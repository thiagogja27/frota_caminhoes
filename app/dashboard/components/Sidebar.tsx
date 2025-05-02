'use client'

import { Button, Nav } from 'react-bootstrap'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/navigation'

export default function Sidebar({ onSelect }: { onSelect: (view: string) => void }) {
  const router = useRouter()
  const supabase = useSupabaseClient()

  // Função de logout
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) router.push('/login')
  }

  return (
    <div style={{
      width: '250px',
      height: '100vh',
      background: '#343a40', // Cor de fundo moderna, mais escura
      padding: '1rem',
      position: 'fixed',
      color: '#fff',
      boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)', // Sombra para destacar
    }}>
      <h5 className="mb-4">Controle de Frota</h5>
      <Nav className="flex-column">
        {['Dashboard', 'Caminhoes', 'Motoristas', 'Viagens', 'Estatísticas'].map((item, idx) => (
          <Nav.Link
            key={idx}
            onClick={() => onSelect(item.toLowerCase())}
            style={navLinkStyle}
          >
            {item}
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

// Estilos para os links da navegação
const navLinkStyle: React.CSSProperties = {
  color: '#ddd', // Cor mais clara para os links
  marginBottom: '0.5rem',
  fontSize: '1rem',
  textTransform: 'uppercase',
  padding: '10px 15px',
  borderRadius: '5px',
  transition: 'all 0.3s ease', // Transição suave para o hover
  cursor: 'pointer', // Para indicar que é clicável
};

// Estilo do botão Sair
const signOutButtonStyle: React.CSSProperties = {
  color: '#dc3545', // Cor do texto do botão Sair
  backgroundColor: 'transparent',
  border: '1px solid #dc3545', // Borda do botão
  padding: '10px 20px',
  borderRadius: '5px',
  transition: 'all 0.3s ease', // Transição suave
  cursor: 'pointer', // Para indicar que é clicável
};

// Efeito de hover para os links
const hoverEffect: React.CSSProperties = {
  backgroundColor: '#6c757d', // Cor prateada ao passar o mouse
  color: '#fff', // Texto branco ao passar o mouse
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra suave
};
