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
    domains: ['avatars.githubusercontent.com'],
    dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default withPlugins(plugins, config)
