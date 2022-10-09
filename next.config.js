// @ts-check
import withPlugins from 'next-compose-plugins'
import { withSentryConfig } from '@sentry/nextjs'
// const withOffline = require('next-offline')
const plugins = [
  withSentryConfig,
  // withOffline,
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
      // type: 'json',
      use: 'yaml-loader',
    })
    // config.module.rules.push({
    //   test: /\.node$/,
    //   loader: 'node-loader'
    // })
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
}

export default withPlugins(plugins, config)
