import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI Financial Analyst",
    short_name: "Fin Analyst",
    description: "Ledger-style AI stock analysis: verdicts, price history, and news for any ticker.",
    start_url: "/",
    display: "standalone",
    background_color: "#12171C",
    theme_color: "#12171C",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
