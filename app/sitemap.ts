import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.camlillico.com/", changeFrequency: "monthly", priority: 1 },
    { url: "https://www.camlillico.com/how-bos360-works", changeFrequency: "monthly", priority: 0.6 },
  ];
}
