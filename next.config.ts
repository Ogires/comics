import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https' as const,
        hostname: 'comicvine.gamespot.com',
      },
      {
        protocol: 'https' as const,
        hostname: 'www.comicvine.com',
      },
    ],
  },
}

export default withPWA(nextConfig)
