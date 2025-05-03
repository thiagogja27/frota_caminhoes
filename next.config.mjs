/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações essenciais para Supabase e Vercel:
  images: {
    domains: ['lh3.googleusercontent.com'], // Para autenticação social (opcional)
  },
  // Melhora a compatibilidade com Supabase:
  experimental: {
    serverActions: true, // Ative se usar Server Actions
    serverComponentsExternalPackages: ['@supabase/supabase-js'], // Para Server Components
  }
};

export default nextConfig;
