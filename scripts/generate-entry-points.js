import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const currentPath = fileURLToPath(import.meta.url);
const projectRoot = path.dirname(currentPath);
const templateFilePath = path.resolve(projectRoot, '../template.html');
const entryPointsDir = path.resolve(projectRoot, '../entry-points');

const ENTRY_POINTS = [
    {
        title: 'dYdX Chain | Leading Decentralized Platform for Crypto Perpetual Trading',
        description: 'Experience the future of decentralized finance with dYdX Chain, the premier platform for secure, transparent, and efficient perpetual trading in the DeFi Space.',
        fileName: 'index.html',
    },
    {
        title: 'dYdX Chain Portfolio | Track Your Orders and Holdings Seamlessly',
        description: 'Manage and review your portfolio on dYdX Chain with real-time insights, balance updates, and performance analytics for informed trading decisions.',
        fileName: 'portfolio.html',
    },
    {
        title: 'dYdX Chain Markets | Explore Tradable Pairs and Market Dynamics',
        description: 'Discover a wide range of cryptocurrency pairs on dYdX Chain. Stay updated with the latest market trends, pricing, and trading opportunities in real-time.',
        fileName: 'markets.html',
    },
    {
        title: 'dYdX Chain Trading Rewards | Earn $DYDX Tokens Through Active Trading',
        description: 'Maximize your trading on dYdX Chain and earn DYDX token rewards. Engage with the platform, contribute to the liquidity, and get rewarded.',
        fileName: 'trading-rewards.html',
    },
    {
        title: 'Trade ETH-USD on dYdX Chain | Ethereum Trading with Deep Liquidity',
        description: 'Engage in Ethereum trading on dYdX Chain with ETH-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.',
        fileName: 'trade-ETH-USD.html',
    },
    {
        title: 'Trade BTC-USD on dYdX Chain | Bitcoin Trading with Deep Liquidity',
        description: 'Engage in Bitcoin trading on dYdX Chain with BTC-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.',
        fileName: 'trade-BTC-USD.html',
    },
    {
        title: 'Trade SOL-USD on dYdX Chain | Solana Trading with Deep Liquidity',
        description: 'Engage in Solana trading on dYdX Chain with SOL-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.',
        fileName: 'trade-SOL-USD.html',
    },
    {
        title: 'Trade AVAX-USD on dYdX Chain | Avalanche Trading with Deep Liquidity',
        description: 'Engage in Avalanche trading on dYdX Chain with AVAX-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.',
        fileName: 'trade-AVAX-USD.html',
    },

    {
        title: 'Trade LINK-USD on dYdX Chain | Chainlink Trading with Deep Liquidity',
        description: 'Engage in Chainlink trading on dYdX Chain with LINK-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.',
        fileName: 'trade-LINK-USD.html',
    },

    {
        title: 'Trade MATIC-USD on dYdX Chain | Polygon Trading with Deep Liquidity',
        description: 'Engage in Polygon trading on dYdX Chain with MATIC-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.',
        fileName: 'trade-MATIC-USD.html',
    },

    {
        title: 'Trade DOGE-USD on dYdX Chain | Dogecoin Trading with Deep Liquidity',
        description: 'Engage in Dogecoin trading on dYdX Chain with DOGE-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.',
        fileName: 'trade-DOGE-USD.html',
    },
];

try {
    fs.mkdir(entryPointsDir, { recursive: true });

    for (const entryPoint of ENTRY_POINTS) {
        const html = await fs.readFile(templateFilePath, 'utf-8');
        const destinationFilePath = path.resolve(entryPointsDir, entryPoint.fileName);
        const injectedHtml = html.replace(
            '<title>dYdX</title>',
            `<title>${entryPoint.title}</title>\n    <meta name="description" content="${entryPoint.description}" />`
        );
        await fs.writeFile(destinationFilePath, injectedHtml, 'utf-8');
    }
} catch (err) {
    console.error('Error generating entry points:', err);
}
