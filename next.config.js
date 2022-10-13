// @ts-check
import withPlugins from 'next-compose-plugins'
import { withSentryConfig } from '@sentry/nextjs'
import PWA from 'next-pwa'

const withPWA = PWA({
  dest: 'public',
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
})

const plugins = [
  withSentryConfig,
  // withOffline,
  withPWA,
]

process.traceDeprecation = true

/**
 * @type {import('next').NextConfig}
 **/
const config = {
  webpack(config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    })
    return config
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'pbs.twimg.com', 'media-exp1.licdn.com'],
  },
}

export default withPlugins(plugins, config)
