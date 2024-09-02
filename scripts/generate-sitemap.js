import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Generating sitemap...');

const currentPath = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentPath);
const staticURLsFilePath = path.resolve(scriptsDir, '../public/configs/staticURLs.json');
const marketsFilePath = path.resolve(scriptsDir, '../public/configs/markets.json');
const sitemapFilePath = path.resolve(scriptsDir, '../public/sitemap.xml');

console.log('staticURLsFilePath:', staticURLsFilePath);
console.log('marketsFilePath:', marketsFilePath);
console.log('sitemapFilePath:', sitemapFilePath);

try {
    const staticURLsJson = await fs.readFile(staticURLsFilePath, 'utf-8');
    const staticURLs = JSON.parse(staticURLsJson);

    const marketsJson = await fs.readFile(marketsFilePath, 'utf-8');
    const markets = JSON.parse(marketsJson);

    const staticPart = staticURLs.map((url) => `
        <url>
            <loc>${url}</loc>
            <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
            <changefreq>daily</changefreq>
            <priority>1.0</priority>
        </url>`
    ).join('');

    const marketsPart = Object.keys(markets).map((pairText) => `
        <url>
            <loc>${import.meta.env.VITE_BASE_URL}trade/${pairText}</loc>
            <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>`
    ).join('');

    const siteMap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPart}
        ${marketsPart}
    </urlset>
    `;

    await fs.writeFile(sitemapFilePath, siteMap, 'utf-8');

    console.log('Sitemap generated successfully.');
} catch (err) {
    console.error('Error generating sitemap:', err);
}
