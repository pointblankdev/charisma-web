module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*' // In production, replace with specific domain
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ]
      }
    ];
  },
  images: {
    dangerouslyAllowSVG: true,
    imageSizes: [24, 64, 300],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { hostname: 's3-us-east-2.amazonaws.com' },
      { hostname: 'QmRrx5WSMsqfcoDuAzKgjj1d84s6Ttb6aVifsEfzwDqaBA' },
      { hostname: 'kghatiwehgh3dclz.public.blob.vercel-storage.com' }
    ]
  },
  webpack: config => {
    config.resolve.fallback = { fs: false };

    return config;
  },
  async redirects() {
    return [
      {
        source: '/odins-raven/:path*',
        destination: '/sip9/odins-raven/:path*',
        permanent: true
      },
      {
        source: '/api/v0/tokens/:path*',
        destination: '/api/v0/metadata/:path*',
        permanent: false
      },
      {
        source: '/pools',
        destination: '/vaults',
        permanent: false
      }
    ];
  },
  experimental: {
    scrollRestoration: true
  },
  staticPageGenerationTimeout: 120 // Increase timeout to 120 seconds
};

// Injected content via Sentry wizard below

// const { withSentryConfig } = require('@sentry/nextjs');

// module.exports = withSentryConfig(module.exports, {
//   // For all available options, see:
//   // https://github.com/getsentry/sentry-webpack-plugin#options

//   org: 'charisma-yy',
//   project: 'charisma-web',

//   // Only print logs for uploading source maps in CI
//   silent: !process.env.CI,

//   // For all available options, see:
//   // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

//   // Upload a larger set of source maps for prettier stack traces (increases build time)
//   widenClientFileUpload: true,

//   // Automatically annotate React components to show their full name in breadcrumbs and session replay
//   reactComponentAnnotation: {
//     enabled: true
//   },

//   // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
//   // This can increase your server load as well as your hosting bill.
//   // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
//   // side errors will fail.
//   tunnelRoute: '/monitoring',

//   // Hides source maps from generated client bundles
//   hideSourceMaps: true,

//   // Automatically tree-shake Sentry logger statements to reduce bundle size
//   disableLogger: true,

//   // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
//   // See the following for more information:
//   // https://docs.sentry.io/product/crons/
//   // https://vercel.com/docs/cron-jobs
//   automaticVercelMonitors: true
// });
