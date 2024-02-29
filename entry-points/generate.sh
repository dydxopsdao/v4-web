#!/bin/sh

cd "$( dirname "${BASH_SOURCE[0]}" )"

TITLE='dYdX Chain | Leading Decentralized Platform for Crypto Perpetual Trading' \
DESCRIPTION='Experience the future of decentralized finance with dYdX Chain, the premier platform for secure, transparent, and efficient perpetual trading in the DeFi Space.' \
envsubst < template.html > generated/index.html

TITLE='dYdX Chain Portfolio | Track Your Orders and Holdings Seamlessly' \
DESCRIPTION='Manage and review your portfolio on dYdX Chain with real-time insights, balance updates, and performance analytics for informed trading decisions.' \
envsubst < template.html > generated/portfolio.html

TITLE='dYdX Chain Markets | Explore Tradable Pairs and Market Dynamics' \
DESCRIPTION='Discover a wide range of cryptocurrency pairs on dYdX Chain. Stay updated with the latest market trends, pricing, and trading opportunities in real-time.' \
envsubst < template.html > generated/markets.html

TITLE='dYdX Chain Trading Rewards | Earn $DYDX Tokens Through Active Trading' \
DESCRIPTION='Maximize your trading on dYdX Chain and earn DYDX token rewards. Engage with the platform, contribute to the liquidity, and get rewarded.' \
envsubst < template.html > generated/trading-rewards.html

TITLE='Trade ETH-USD on dYdX Chain | Ethereum Trading with Deep Liquidity' \
DESCRIPTION='Engage in Ethereum trading on dYdX Chain with ETH-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.' \
envsubst < template.html > generated/trade-ETH-USD.html

TITLE='Trade BTC-USD on dYdX Chain | Bitcoin Trading with Deep Liquidity' \
DESCRIPTION='Engage in Bitcoin trading on dYdX Chain with BTC-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.' \
envsubst < template.html > generated/trade-BTC-USD.html

TITLE='Trade SOL-USD on dYdX Chain | Solana Trading with Deep Liquidity' \
DESCRIPTION='Engage in Solana trading on dYdX Chain with SOL-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.' \
envsubst < template.html > generated/trade-SOL-USD.html

TITLE='Trade AVAX-USD on dYdX Chain | Avalanche Trading with Deep Liquidity' \
DESCRIPTION='Engage in Avalanche trading on dYdX Chain with AVAX-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.' \
envsubst < template.html > generated/trade-AVAX-USD.html

TITLE='Trade LINK-USD on dYdX Chain | Chainlink Trading with Deep Liquidity' \
DESCRIPTION='Engage in Chainlink trading on dYdX Chain with LINK-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.' \
envsubst < template.html > generated/trade-LINK-USD.html

TITLE='Trade MATIC-USD on dYdX Chain | Polygon Trading with Deep Liquidity' \
DESCRIPTION='Engage in Polygon trading on dYdX Chain with MATIC-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.' \
envsubst < template.html > generated/trade-MATIC-USD.html

TITLE='Trade DOGE-USD on dYdX Chain | Dogecoin Trading with Deep Liquidity' \
DESCRIPTION='Engage in Dogecoin trading on dYdX Chain with DOGE-USD pair, benefiting from deep liquidity, tight spreads, and advanced trading features.' \
envsubst < template.html > generated/trade-DOGE-USD.html

# TITLE='dYdX Chain Documentation | Comprehensive Guides & Techical Documentation' \
# DESCRIPTION='Access detailed documentation for dYdX Chain, including in-depth guides, API references, and all the resources you need to navigate the DeFi platform.' \
# envsubst < template.html > generated/docs.html

# TITLE='dYdX Chain Help Center | Support and FAQs for dYdX Chain Users' \
# DESCRIPTION='Find answers to common questions, get troubleshooting tips, and access user support to ensure a seamless experience on the dYdX Chain.' \
# envsubst < template.html > generated/help.html
