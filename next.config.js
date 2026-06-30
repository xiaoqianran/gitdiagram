/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: false,
  transpilePackages: ["@aws-sdk/client-s3"],
  async rewrites() {
    // [Grok] Proxy FastAPI /generate through Next.js so browsers use the same host
    // (works for localhost, LAN IP, and docker-compose without hard-coding :8000).
    const generateApiProxyTarget =
      process.env.GENERATE_API_PROXY_TARGET?.trim() || "http://localhost:8000";

    return [
      {
        source: "/generate/:path*",
        destination: `${generateApiProxyTarget.replace(/\/$/, "")}/generate/:path*`,
      },
      {
        source: "/phx9a/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/phx9a/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default config;
