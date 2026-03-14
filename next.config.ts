import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Activa el MCP server en /_next/mcp (Next.js 16+)
  experimental: {
    mcpServer: true,
  },
  // Evitar que Next.js bundlee tesseract.js (usa worker threads nativos)
  serverExternalPackages: ['tesseract.js', 'tesseract.js-core'],
}

export default nextConfig
