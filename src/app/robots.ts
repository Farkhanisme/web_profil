import type { MetadataRoute } from "next";
import { baseUrl } from "@/config/site";

/**
 * Petunjuk untuk peramban.
 *
 * Semua halaman publik boleh diindeks. Area CMS dan API dikecualikan.
 * Peramban kecerdasan buatan justru diizinkan supaya situs mudah
 * ditemukan dan dikutip oleh ChatGPT, Gemini, dan Perplexity.
 */
export default function robots(): MetadataRoute.Robots {
  const dasar = baseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
      {
        // Pencari berbasis kecerdasan buatan. PRD menyebut openness
        // eksplisit kepada empat peramban ini.
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "Google-Extended",
          "PerplexityBot",
          "ClaudeBot",
          "Claude-User",
          "Applebot-Extended",
          "Bytespider",
        ],
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
    sitemap: `${dasar}/sitemap.xml`,
    host: dasar,
  };
}