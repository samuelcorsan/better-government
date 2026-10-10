import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/site';

// Solo páginas indexables: /chat y /admin llevan noindex.
const pages = [
  { path: '/', priority: 1 },
  { path: '/equipo', priority: 0.7 },
  { path: '/sources', priority: 0.7 },
  { path: '/how-it-works', priority: 0.6 },
  { path: '/privacy', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map(({ path, priority }) => ({
    url: new URL(path, siteUrl).href,
    changeFrequency: 'weekly',
    priority,
  }));
}
