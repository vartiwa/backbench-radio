import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Content-Security-Policy — allowlists every external resource the app loads
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://fonts.googleapis.com
    https://va.vercel-scripts.com
    https://www.youtube.com
    https://s.ytimg.com;
  style-src 'self' 'unsafe-inline'
    https://fonts.googleapis.com
    https://fonts.gstatic.com;
  font-src 'self'
    https://fonts.gstatic.com;
  img-src 'self' data: blob: https:;
  media-src 'self' blob: data: https:;
  connect-src 'self'
    https://vitals.vercel-insights.com
    https://va.vercel-scripts.com;
  frame-src
    https://www.youtube.com
    https://www.youtube-nocookie.com;
  worker-src 'self' blob:;
`.replace(/\n/g, " ").trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Strict Mode double-invokes useEffect which destroys our Audio object
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  headers: async () => [
    {
      source: "/:path*",
      headers: [
        {
          key: "Content-Security-Policy",
          value: ContentSecurityPolicy,
        },
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;
