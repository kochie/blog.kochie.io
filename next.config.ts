// @ts-check
import { withSentryConfig } from '@sentry/nextjs'
import withPWAInit from '@ducanh2912/next-pwa'
// import runtimeCaching from 'next-pwa/cache'
import bundleAnalyzer from '@next/bundle-analyzer'
import { NextConfig } from 'next'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  workboxOptions: {
    skipWaiting: true,
    maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
  },
})

let config: NextConfig = {
  webpack(config, context) {
    config.experiments = { ...config.experiments, topLevelAwait: true }

    config.module.rules.push({
      test: /\.ya?ml$/,
      use: [
        {
          loader: 'yaml-loader',
        },
      ],
    })

    return config
  },
  reactStrictMode: true,
  // transpilePackages: ['d3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },

  modularizeImports: {
    '@/components': {
      transform: '@/components/{{member}}',
    },
  },
}

const plugins = [
  {
    plugin: withPWA,
    env: ['production'],
    name: 'PWA',
  },
  {
    name: 'Sentry',
    plugin: withSentryConfig,
    env: ['production'],
    options: [
      {},
      {
        org: 'kochie',
        project: 'blog_kochie_io',
        // Only print logs for uploading source maps in CI
        // Set to `true` to suppress logs
        silent: !process.env.CI,
        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
      },
    ],
  },
  { name: 'Bundle Analyzer', plugin: withBundleAnalyzer },
]

console.log('ANALYZE', process.env.ANALYZE === 'true')

for (const plug of plugins) {
  if (!plug.env || plug.env.includes(process.env.NODE_ENV)) {
    console.log('applying plugin', plug.name)
    if (plug.options) config = plug.plugin(config, ...plug.options)
    else config = plug.plugin(config)
  }
}

export default withSentryConfig(config, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'kochie',
  project: 'blog_kochie_io',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
})
