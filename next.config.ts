import type { NextConfig } from "next";

/**
 * Header keamanan dasar.
 *
 * CSP sengaja dibuat ketat tetapi tetap memblokir peta Google, karena
 * peta adalah satu-satunya skrip pihak ketiga yang dipakai situs ini.
 * Token bot, rahasia Auth.js, dan kredensial Turso hanya ada di
 * variabel lingkungan server, tidak pernah sampai ke peramban.
 */
/** `unsafe-eval` hanya dibutuhkan mode pengembangan (React Refresh). */
const MODE_PENGEMBANGAN = process.env.NODE_ENV !== "production";

const KEBIJAKAN_CSP = [
  "default-src 'self'",
  // 'unsafe-inline' pada style diperlukan karena Tailwind dan blok
  // warna tema ditulis sebagai tag <style> di dalam <head>.
  "style-src 'self' 'unsafe-inline'",
  // Di produksi, eval dilarang: sehingga satu celah injeksi skrip tidak
  // langsung bisa menjalankan kode sembarang lewat `eval`.
  `script-src 'self' 'unsafe-inline'${
    MODE_PENGEMBANGAN ? " 'unsafe-eval'" : ""
  }`,
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  // Peta Google dan gambar dari CDN-nya.
  "frame-src https://www.google.com https://maps.google.com",
  "connect-src 'self' https://www.google.com",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  /**
   * Paket yang punya binding native / tidak boleh di-bundle Turbopack.
   */
  serverExternalPackages: ["@libsql/client", "sharp", "bcryptjs"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: KEBIJAKAN_CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;