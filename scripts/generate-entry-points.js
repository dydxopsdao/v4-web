import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const currentPath = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(currentPath);
const templateFilePath = path.resolve(projectRoot, '../template.html');
const entryPointsDir = path.resolve(projectRoot, '../entry-points');

const TOP_MARKETS_URL = 'https://indexer.dydx.trade/v4/perpetualMarkets';
const ENTRY_POINTS = [
    {
        title: 'dYdX | Leading Decentralized Platform for Crypto Perpetual Trading',
        description: 'Experience dYdX, DeFi\'s pro decentralized trading platform, offering secure, transparent, and powerful perpetual trading.',
        fileName: 'index.html',
    },
    {
        title: 'dYdX Portfolio | Track Your Orders and Holdings Seamlessly',
        description: 'Manage and review your portfolio on dYdX with real-time insights, balance updates, and performance analytics for informed trading decisions.',
        fileName: 'portfolio.html',
    },
    {
        title: 'dYdX Markets | Explore BTC, ETH, SOL and 180 more Crypto Markets',
        description: 'Access over 180 cryptocurrency markets on dYdX. Trade popular crypto pairs with competitive fees and robust security on our decentralized platform.',
        fileName: 'markets.html',
    },
    {
        title: 'dYdX Trading Rewards | Earn $DYDX Tokens Through Trading & Staking',
        description: 'Maximize your trading on dYdX and earn $DYDX token rewards. Engage with the platform, contribute to the liquidity, and get rewarded.',
        fileName: 'trading-rewards.html',
    },
];

try {
    console.log(`Fetching top markets from ${TOP_MARKETS_URL} ...`);
    for (const market of await fetchTopMarkets(TOP_MARKETS_URL)) {
        ENTRY_POINTS.push({
            title: `Trade ${market} on dYdX | DeFi's pro decentralized trading platform`,
            description: `Engage in decentralized ${market} trading on dYdX, benefit from deep liquidity, self-custody, and advanced trading features.`,
            fileName: `trade-${market}.html`,
        });
    }

    await fs.mkdir(entryPointsDir, { recursive: true });

    console.log(`Generating entry points (${ENTRY_POINTS.length})...`);
    const templateHtml = await fs.readFile(templateFilePath, 'utf-8');
    for (const entryPoint of ENTRY_POINTS) {
        const destinationFilePath = path.resolve(entryPointsDir, entryPoint.fileName);
        const injectedHtml = templateHtml.replace(
            '<title>dYdX</title>',
            `<title>${entryPoint.title}</title>\n    <meta name="description" content="${entryPoint.description}" />`
        );
        await fs.writeFile(destinationFilePath, injectedHtml, 'utf-8');
    }
    console.log(`Done!`);
} catch (err) {
    console.error('Error generating entry points:', err);
}

/**
 * Fetches the top 100 trade pairs by volume from the dYdX indexer API
 * @returns {Promise<string[]>} Array of top trade pairs
 * @throws {Error} If the API request fails
 */
async function fetchTopMarkets(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    // Convert markets object to array of entries and sort by volume
    const sortedMarkets = Object.entries(data.markets)
        .sort((a, b) => {
            const volumeA = parseFloat(a[1].volume24H);
            const volumeB = parseFloat(b[1].volume24H);
            return volumeB - volumeA;
        })
        .slice(0, 100) // Take top 100
        .map(([_, market]) => {
            return market.ticker;
        });

    return sortedMarkets;
}
