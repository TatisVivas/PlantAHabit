import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mi Jardín de Hábitos",
    short_name: "Mi Jardín",
    description:
      "Cultiva tus hábitos cada día: semilla, brote, arbusto y floración.",
    start_url: "/",
    display: "standalone",
    background_color: "#EDEFE4",
    theme_color: "#5C7A4F",
    lang: "es",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
