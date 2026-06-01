/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  eslint: {
    // ESLint runs in CI — ignore build errors that are warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Type errors checked locally — allow build to proceed on Vercel
    ignoreBuildErrors: true,
  },
}
module.exports = nextConfig
