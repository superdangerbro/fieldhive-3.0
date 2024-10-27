/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@fieldhive/shared'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.ts$/,
      include: /packages\/shared/,
      use: [{ loader: 'ts-loader' }],
    });
    return config;
  },
}

module.exports = nextConfig
