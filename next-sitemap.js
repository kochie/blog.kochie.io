module.exports = {
  siteUrl: `https://${
    process.env.NEXT_PUBLIC_PROD_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'blog.kochie.io'
  }`,
  generateRobotsTxt: true, // (optional)
  // ...other options
}
