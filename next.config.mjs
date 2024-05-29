// @ts-check
import { withSentryConfig } from '@sentry/nextjs'
import PWA from 'next-pwa'
// import runtimeCaching from 'next-pwa/cache'
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const withPWA = PWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
})

/**
 * @type {import('next').NextConfig}
 **/
let config = {
  webpack(config, context) {
    config.experiments = { ...config.experiments, topLevelAwait: true }

    config.module.rules.push({
      test: /\.ya?ml$/,
      use: [
        {
          loader: 'yaml-loader',
        },
      ],
    })

    return config
  },
  reactStrictMode: true,
  // transpilePackages: ['d3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },

  modularizeImports: {
    '@/components': {
      transform: '@/components/{{member}}',
    },
  },
}

const plugins = [
  {
    plugin: withPWA,
    env: ['production'],
    name: 'PWA',
  },
  {
    name: 'Sentry',
    plugin: withSentryConfig,
    env: ['production'],
    options: [
      {},
      {
        hideSourceMaps: false,
      },
    ],
  },
  { name: 'Bundle Analyzer', plugin: withBundleAnalyzer },
]

console.log('ANALYZE', process.env.ANALYZE === 'true')

for (const plug of plugins) {
  if (!plug.env || plug.env.includes(process.env.NODE_ENV)) {
    console.log('applying plugin', plug.name)
    if (plug.options) config = plug.plugin(config, ...plug.options)
    else config = plug.plugin(config)
  }
}

export default config
