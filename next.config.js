const withPlugins = require('next-compose-plugins');
const withMDX = require('@zeit/next-mdx')()
const withTypescript = require('@zeit/next-typescript')
const withOffline = require('next-offline')
const withLess = require('@zeit/next-less')

const plugins = [withMDX, withTypescript, withOffline, withLess]

const config = {
    cssModules: true,
    target: 'serverless',
    workboxOpts: {
    swDest: 'static/service-worker.js',
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'https-calls',
          networkTimeoutSeconds: 15,
          expiration: {
            maxEntries: 150,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
}

module.exports = withPlugins(plugins, config)