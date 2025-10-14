/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enforce ESLint and TypeScript during builds
  // eslint: { ignoreDuringBuilds: true },
  // typescript: { ignoreBuildErrors: true },
  images: {
    unoptimized: true,
  },
  // Allow all hosts for Replit environment
  experimental: {
    allowedRevalidateHeaderKeys: ['*'],
  },
  // Disable host header verification for dev mode
  devIndicators: {
    buildActivity: false,
  },
}

export default nextConfig
