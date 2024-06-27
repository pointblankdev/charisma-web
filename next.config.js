module.exports = {
  images: {
    domains: [
      'www.datocms-assets.com',
      'charisma.rocks',
      'raw.githubusercontent.com',
      'cdn.discordapp.com'
    ],
    imageSizes: [24, 64, 300],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.datocms-assets.com',
        port: '',
        pathname: '/**',
      },
      // TODO: REMOVE THIS
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/stake',
        destination: '/stake/welsh',
        permanent: true,
      },
      {
        source: '/stake-roo',
        destination: '/stake/roo',
        permanent: true,
      },
      {
        source: '/woooooo',
        destination: '/apps/title-fight',
        permanent: true,
      },
    ]
  },
  experimental: {
    scrollRestoration: true,
  },
  staticPageGenerationTimeout: 120, // Increase timeout to 120 seconds
};
