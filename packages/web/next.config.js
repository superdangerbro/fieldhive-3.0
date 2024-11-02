/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fieldhive/shared', 'react-map-gl', 'mapbox-gl'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ts$/,
      include: /packages\/shared/,
      use: [{ loader: 'ts-loader' }],
    });

    // Handle mapbox-gl and react-map-gl
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': require.resolve('mapbox-gl'),
      'react-map-gl': require.resolve('react-map-gl'),
    };

    return config;
  },
  // Needed for mapbox-gl and react-map-gl
  experimental: {
    esmExternals: false
  },
  // Add API proxy configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig
