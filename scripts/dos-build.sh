#!/bin/sh

echo "Building (DOS)..."

node scripts/generate-sitemap.js

pnpm run build --mode production \
    && pnpm run build:inject-app-deeplinks \
    && pnpm run build:inject-analytics \
    && pnpm run build:inject-intercom \
    && pnpm run build:inject-statuspage \
    && pnpm run build:inject-smartbanner \
    && pnpm run build:inject-google-tag-manager
