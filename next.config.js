/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins')
const withOffline = require('next-offline')
const { withSentryConfig } = require('@sentry/nextjs')

const plugins = [withOffline, withSentryConfig]

const config = {
  target: 'serverless',
  webpack5: true,
  webpack(config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      type: 'json',
      use: 'yaml-loader',
    })

    return config
  },
  i18n: {
    locales: ['en-AU'],
    defaultLocale: 'en-AU',
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
  },
  async rewrites() {
    return [
      {
        source: '/service-worker.js',
        destination: '/_next/static/service-worker.js',
      },
    ]
  }
}

module.exports = withPlugins(plugins, config)
