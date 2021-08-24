/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins')
const { withSentryConfig } = require('@sentry/nextjs')
const withOffline = require('next-offline')
// const { withSentryConfig } = require('@sentry/nextjs')
const plugins = [withSentryConfig, withOffline]

const config = {
  experimental: { esmExternals: true },
  target: 'serverless',
  webpack(config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      type: 'json',
      use: 'yaml-loader',
    })
    return config
  },
  SentryWebpackPluginOptions: {
    silent: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
  workboxOpts: {
    swDest: process.env.NEXT_EXPORT
      ? 'service-worker.js'
      : 'static/service-worker.js',
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
    maximumFileSizeToCacheInBytes: 10_000_000
  },
  async rewrites() {
    return [
      {
        source: '/service-worker.js',
        destination: '/_next/static/service-worker.js',
      },
    ]
  },
}

module.exports = withPlugins(plugins, config)
