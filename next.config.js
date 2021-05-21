/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins')
const withOffline = require('next-offline')

const plugins = [withOffline]

const config = {
  target: 'serverless',
  transformManifest: (manifest) => ['/'].concat(manifest), // add the homepage to the cache
  // Trying to set NODE_ENV=production when running yarn dev causes a build-time error so we
  // turn on the SW in dev mode so that we can actually test it
  generateInDevMode: false,
  // handleImages: ['jpeg', 'jpg', 'png', 'svg', 'webp', 'gif'],
  workboxOpts: {
    maximumFileSizeToCacheInBytes: 1024 * 1024 * 10,
    swDest: 'service-worker.js',
  },
  future: {
    webpack5: true,
  },
  webpack(config) {
       config.module.rules.push({
          test: /\.ya?ml$/,
          type: 'json',
          use: 'yaml-loader'
       })

    return config
  }
}

module.exports = withPlugins(plugins, config)
