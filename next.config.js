/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins')
const withMDX = require('@zeit/next-mdx')()
const withOffline = require('next-offline')
const optimizedImages = require('next-optimized-images')

const plugins = [withMDX, withOffline]

const config = {
  target: 'serverless',
  transformManifest: (manifest) => ['/'].concat(manifest), // add the homepage to the cache
  // Trying to set NODE_ENV=production when running yarn dev causes a build-time error so we
  // turn on the SW in dev mode so that we can actually test it
  generateInDevMode: false,
  handleImages: ['jpeg', 'jpg', 'png', 'svg', 'webp', 'gif'],
  workboxOpts: {
    maximumFileSizeToCacheInBytes: 1024 * 1024 * 10,
    swDest: 'service-worker.js',
  },
  webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
    const imagesFolder = 'images'
    const imagesName = '[name]-[hash].[ext]'
    // const imagesPublicPath = ""

    let publicPath = `/_next/static/${imagesFolder}/`

    // if (!!imagesPublicPath) {
    //   publicPath = imagesPublicPath;
    // } else if (!!assetPrefix) {
    //   publicPath = `${assetPrefix}${assetPrefix.endsWith('/') ? '' : '/'}_next/static/${imagesFolder}/`;
    // }

    config.module.rules.push({
      test: /\.(png|jpe?g)$/,
      loaders: [
        {
          loader: require.resolve('./custom-loader.js'),
        },
        {
          loader: 'lqip-loader',
          options: {
            path: '/media',
            name: imagesName,
            base64: true,
            palette: true,
          },
        },
        {
          loader: 'file-loader',
          options: {
            publicPath,
            outputPath: `${isServer ? '../' : ''}static/${imagesFolder}/`,
            name: imagesName,
          },
        },
      ],
    })
    config.module.rules.push({
      test: /\.svg$/,
      loaders: [
        {
          loader: 'url-loader',
        },
      ],
    })
    return config
  },
}

module.exports = withPlugins(plugins, config)
