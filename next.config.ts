// next.config.js
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    // For client-side bundles, provide a fallback for 'fs'
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },

  // Make sure you have NO custom `postcssLoaderOptions`
  // or CSS module overrides here
  // (remove/disable any webpack.modify or experimental.css settings)

  // If you were experimenting with the App Dir, disable it:

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-0539ca942f4a457a83573a5585904cba.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.anthroposcity.com',
      },
    ],
  },

  eslint: {
    // Skip all ESLint errors in CI / Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type-checking errors in CI / Vercel
    ignoreBuildErrors: true,
  },

}

module.exports = nextConfig
