/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { 
    appDir: true,
    // Ensure API routes are properly handled
    serverComponentsExternalPackages: ['@prisma/client']
  },
  // IMPORTANT: do NOT set output:'export' here. We need server functions for /api
  images: { formats: ['image/avif','image/webp'] },
};
export default nextConfig;