/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  // Configuração CORRETA para Supabase:
  serverExternalPackages: ['@supabase/supabase-js'], // Substitui serverComponentsExternalPackages
  experimental: {
    // Remova serverActions ou defina como objeto vazio se não for usar
  }
};

export default nextConfig;