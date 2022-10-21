// @ts-check
import { withSentryConfig } from '@sentry/nextjs'
import PWA from 'next-pwa'

const withPWA = PWA({
  dest: 'public',
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
})

/**
 * @type {import('next').NextConfig}
 **/
let config = {
  webpack(config) {
    config.module.rules.push({
      test: /\.ya?ml$/,
      use: 'yaml-loader',
    })
    return config
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'pbs.twimg.com'],
    dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

const plugins = [
  {
    plugin: withPWA,
    env: ['production'],
  },
  { plugin: withSentryConfig, env: ['production'] },
]

for (const plug of plugins) {
  if (plug.env.includes(process.env.NODE_ENV)) {
    // eslint-disable-next-line
    // @ts-ignore
    config = plug.plugin(config)
  }
}

export default config
