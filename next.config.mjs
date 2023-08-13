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
  register: true, skipWaiting: true,
  maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
})

/**
 * @type {import('next').NextConfig}
 **/
let config = {
  webpack(config) {
    config.experiments = {...config.experiments, topLevelAwait: true}

    return config
  },
  reactStrictMode: true,
  experimental: {
    appDir: true,
    newNextLinkBehavior: true,
  },
  // transpilePackages: ['d3'],
  images: {
    domains: ['avatars.githubusercontent.com', 'pbs.twimg.com'],
    // dangerouslyAllowSVG: true,
    // contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
  },
  { plugin: withSentryConfig, env: ['production'], options: [{}, {
    hideSourceMaps: false,
  }] },
  { plugin: withBundleAnalyzer },
]

for (const plug of plugins) {
  if (!plug.env || plug.env.includes(process.env.NODE_ENV)) {
    // eslint-disable-next-line
    // @ts-ignore
    if (plug.options) config = plug.plugin(config, ...plug.options)
    else plug.plugin(config)
  }
}

export default config
