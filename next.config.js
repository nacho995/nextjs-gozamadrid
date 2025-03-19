/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_API_URL: 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
    NEXT_PUBLIC_WC_API_URL: 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3',
    NEXT_PUBLIC_WOO_COMMERCE_KEY: 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85',
    NEXT_PUBLIC_WOO_COMMERCE_SECRET: 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e',
  },
  experimental: {
    appDir: false,
  },
}

module.exports = nextConfig;
