// next.config.js
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Make sure you have NO custom `postcssLoaderOptions`
  // or CSS module overrides here
  // (remove/disable any webpack.modify or experimental.css settings)

  // If you were experimenting with the App Dir, disable it:

  images: {
    domains: [
      'pub-0539ca942f4a457a83573a5585904cba.r2.dev'  // Your R2 domain
    ],
  },
}

module.exports = nextConfig
