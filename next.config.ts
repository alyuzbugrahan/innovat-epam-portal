import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverExternalPackages: ['bcrypt'],
  },
}

export default nextConfig
