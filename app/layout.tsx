// app/layout.tsx
// app/layout.tsx
import 'bootstrap/dist/css/bootstrap.min.css'

import './globals.css'
import { AuthProvider } from './AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
       
        </AuthProvider>
      </body>
    </html>
  )
}
