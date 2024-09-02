import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Generating sitemap...');

const currentPath = fileURLToPath(import.meta.url);
const scriptsDir = path.dirname(currentPath);
const sitemapConfigFilePath = path.resolve(scriptsDir, '../public/configs/sitemap.json');
const marketsFilePath = path.resolve(scriptsDir, '../public/configs/markets.json');
const sitemapFilePath = path.resolve(scriptsDir, '../public/sitemap.xml');

try {
    const sitemapConfigJson = await fs.readFile(sitemapConfigFilePath, 'utf-8');
    const baseURL = JSON.parse(sitemapConfigJson)['baseURL'];
    const staticURLs = JSON.parse(sitemapConfigJson)['staticURLs'];

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
            <loc>${baseURL}/trade/${pairText}</loc>
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
