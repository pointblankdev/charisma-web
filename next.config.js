module.exports = {
  images: {
    domains: [
      'www.datocms-assets.com',
    ],
    imageSizes: [24, 64, 300],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.datocms-assets.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    scrollRestoration: true,
  },
  staticPageGenerationTimeout: 120, // Increase timeout to 120 seconds
};
