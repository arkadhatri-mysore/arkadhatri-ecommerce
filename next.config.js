const nextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
    ],
  },
  // Renamed from experimental.serverComponentsExternalPackages in Next 15
  serverExternalPackages: ['mongodb'],
  webpack(config, { dev }) {
    if (dev) {
      // Reduce CPU/memory from file watching
      config.watchOptions = {
        poll: 2000, // check every 2 seconds
        aggregateTimeout: 300, // wait before rebuilding
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
  onDemandEntries: {
    maxInactiveAge: 120000,
    pagesBufferLength: 6,
  },
  // Preview proxy hosts (dev only; ignored in production builds)
  allowedDevOrigins: ['*.preview.emergentagent.com', '*.preview.emergentcf.cloud', '*.emergentagent.com'],
  async headers() {
    // Framing: own site + Emergent preview/editor only (override with FRAME_ANCESTORS, space-separated).
    const frameAncestors = process.env.FRAME_ANCESTORS ||
      "'self' https://*.emergentagent.com https://*.emergent.sh https://*.emergentcf.cloud https://app.emergent.sh"
    const isProd = process.env.NODE_ENV === "production"
    const security = [
      { key: "Content-Security-Policy", value: `frame-ancestors ${frameAncestors};` },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Razorpay Checkout needs the payment feature, so it is not restricted here.
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      ...(isProd ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
    ]
    return [
      { source: "/(.*)", headers: security },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

module.exports = nextConfig;
