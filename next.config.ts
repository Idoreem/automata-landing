import type { NextConfig } from "next";

// כותרות אבטחה — CSP תואם לפיקסל של מטא (גם כשהוא כבוי)
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://www.facebook.com",
      "font-src 'self' data:",
      "connect-src 'self' https://www.facebook.com https://connect.facebook.net",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // הדף חי תחת /landing — כך הוא מוגש גם דרך הכתובת המשותפת automata-site.vercel.app/landing
  basePath: "/landing",
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // הכתובת הישנה בשורש ממשיכה לעבוד
      { source: "/", destination: "/landing", basePath: false, permanent: false },
    ];
  },
};

export default nextConfig;
