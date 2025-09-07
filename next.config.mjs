/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable in Next.js 14
  experimental: {
    // Ensure API routes are properly handled
    serverComponentsExternalPackages: ['@prisma/client']
  }
};
export default nextConfig;