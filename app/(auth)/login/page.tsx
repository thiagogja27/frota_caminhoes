'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { Form, Button, Container, Row, Col, Alert, Card } from 'react-bootstrap'
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  // Criação do cliente Supabase
  const supabase = createPagesBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('Email ou senha incorretos')
    } else {
      // Redireciona com reload para garantir atualização da sessão
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="bg-light d-flex justify-content-center align-items-center vh-100">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
            <Card className="p-4 shadow border-0">
              <div className="text-center mb-4">
                


                <Image
  src="/img/logo-frota.png"
  alt="Logo Frota"
  width={200}
  height={180} // Mantenha a proporção real da imagem
  priority
/>
                <h3 className="mt-3">Sistema de Frotas</h3>
                <p className="text-muted">Acesso restrito para motoristas e gestores</p>
              </div>

              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label>Email corporativo</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="ex: motorista@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button type="submit" variant="dark" className="w-100">
                  Entrar
                </Button>

                {error && (
                  <Alert variant="danger" className="mt-3 text-center">
                    {error}
                  </Alert>
                )}
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
