#!/bin/sh

echo "Building (DOS)..."

pnpm run build:set-last-commit-and-tag
pnpm run build:generate-entry-points
pnpm run build:generate-sitemap
tsc
vite build
pnpm run build:inject-app-deeplinks
pnpm run build:inject-analytics
pnpm run build:inject-intercom
pnpm run build:inject-statuspage
pnpm run build:inject-smartbanner
pnpm run build:inject-google-tag-manager
