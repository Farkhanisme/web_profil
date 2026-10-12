import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,

  /**
   * Paket yang punya binding native / tidak boleh di-bundle oleh Turbopack.
   * - @libsql/client : memuat driver SQLite dan HTTP
   * - sharp          : memuat libvips
   * - bcryptjs       : versi pure JS, tetap dikecualikan agar tidak ikut ter-bundle
   */
  serverExternalPackages: ["@libsql/client", "sharp", "bcryptjs"],

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
