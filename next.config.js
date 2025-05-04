/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
  async redirects() {
    return [
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'ankurmali.com' }],
        permanent: true,
        destination: 'https://ankurmali.com/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
