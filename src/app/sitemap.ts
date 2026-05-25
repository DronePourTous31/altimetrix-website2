import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://altimetrix.fr";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/tarifs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/tutoriels`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/auth/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/auth/register`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cgu`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
