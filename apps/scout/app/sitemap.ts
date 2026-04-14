import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SCOUT_URL ?? 'https://scout.evuno.co';
  const locales = ['en', 'es'];
  const routes = ['', '/calculator', '/privacy', '/terms'];

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: route === '' ? 1.0 : route === '/calculator' ? 0.9 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${baseUrl}/${l}${route}`]),
        ),
      },
    })),
  );
}
