const withPlugins = require('next-compose-plugins');
const withMDX = require('@zeit/next-mdx')()
const withTypescript = require('@zeit/next-typescript')
const withOffline = require('next-offline')
const withLess = require('@zeit/next-less')

const plugins = [withMDX, withTypescript, withOffline, withLess]

const config = {
    cssModules: true,
    target: 'serverless'
}

module.exports = withPlugins(plugins, config)