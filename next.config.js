/* eslint-disable @typescript-eslint/no-var-requires */
const withPlugins = require('next-compose-plugins')
const rehypePrism = require('@mapbox/rehype-prism')
const remarkMath = require('remark-math')
const rehypeKatex = require('rehype-katex')
const rehypeMathjax = require('rehype-mathjax')
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex]
  }
})
const withOffline = require('next-offline')

const plugins = [withMDX, withOffline]

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
  webpack(config, { buildId, dev, isServer, defaultLoaders, webpack }) {
    const imagesFolder = 'images'
    const imagesName = '[name]-[hash].[ext]'
    const publicPath = `/_next/static/${imagesFolder}/`

    config.module.rules.push({
      test: /\.(png|jpe?g)$/,
      use: [
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
            esModule: false,
            publicPath,
            outputPath: `${isServer ? '../' : ''}static/${imagesFolder}/`,
            name: imagesName,
          },
        },
      ],
    })
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: 'url-loader',
        },
      ],
    })
    return config
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx']
}

module.exports = withPlugins(plugins, config)
