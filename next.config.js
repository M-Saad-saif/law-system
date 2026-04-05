/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'bcryptjs'],
  },
  images: {
    remotePatterns: [],
  },
  // These pages are server-rendered on demand, not statically generated
  // Prerender errors on them are expected and harmless for npm start/dev
};

module.exports = nextConfig;
