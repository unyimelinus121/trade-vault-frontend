const development = process.env.NODE_ENV !== "production";
if (!development) {
  const missing = ["BACKEND_URL"].filter(
    (name) => !process.env[name],
  );
  if (missing.length)
    throw new Error(`${missing.join(", ")} must be configured for production`);
}
const configuredConnections = [
  process.env.NEXT_PUBLIC_API_URL,
  process.env.NEXT_PUBLIC_SOCKET_URL,
]
  .filter((value) => /^https?:\/\//.test(value || ""))
  .flatMap((value) => {
    const url = new URL(value);
    const socketProtocol = url.protocol === "https:" ? "wss:" : "ws:";
    return [url.origin, `${socketProtocol}//${url.host}`];
  });
const localDevelopmentConnections = development
  ? [
      "http://127.0.0.1:4001",
      "http://localhost:4001",
      "http://192.168.0.169:4001",
      "http://172.20.10.2:4001",

      "ws://127.0.0.1:4001",
      "ws://localhost:4001",
      "ws://192.168.0.169:4001",
      "ws://172.20.10.2:4001",
    ]
  : [];
const configuredImageOrigins = [process.env.NEXT_PUBLIC_API_URL]
  .filter((value) => /^https?:\/\//.test(value || ""))
  .map((value) => new URL(value).origin);

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `img-src 'self' data: blob: https: ${development ? "http://127.0.0.1:4001 http://localhost:4001" : ""} ${configuredImageOrigins.join(" ")}`,
  `connect-src 'self' ${[...localDevelopmentConnections, ...configuredConnections].join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(development ? [] : ["upgrade-insecure-requests"]),
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  agentRules: false,
  // Keep the LAN addresses used by the local Wi-Fi/hotspot available for
  // device testing. Next.js otherwise blocks its client-side JavaScript.
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.0.169", "172.20.10.2"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=()",
          },
          ...(!development
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
