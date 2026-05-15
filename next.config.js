/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Use strict type checking
    tsconfigPath: './tsconfig.json',
  },
  eslint: {
    dirs: ['app', 'components', 'lib'],
  },
  images: {
    remotePatterns: [],
  },
}

module.exports = nextConfig
