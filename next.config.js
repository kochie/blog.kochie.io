// @ts-check
const withPlugins = require('next-compose-plugins')
const { withSentryConfig } = require('@sentry/nextjs')
const withOffline = require('next-offline')
const plugins = [
  withSentryConfig,
  withOffline,
]

process.traceDeprecation = true

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  // experimental: { esmExternals: true },
  // target: 'serverless',
  webpack(config, options) {
    // console.log(options.defaultLoaders.babel)
    config.module.rules.push({
      test: /\.ya?ml$/,
      type: 'json',
      use: 'yaml-loader',
    })
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader'
    })
    // config.node = {__dirname: false}
    return config
  },
  // SentryWebpackPluginOptions: {
  //   silent: true,
  // },
  silent: true,
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
    maximumFileSizeToCacheInBytes: 10_000_000,
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
