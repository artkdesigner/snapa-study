#!/usr/bin/env bash
# Собирает сайт и выкладывает его на этот VPS: dist/ → /var/www/snapa,
# отдаёт Caddy (блок snapa.art-kalinin-design.ru в /etc/caddy/Caddyfile).
set -euo pipefail
cd "$(dirname "$0")/.."

npm run build
rm -rf /var/www/snapa.new
cp -r dist /var/www/snapa.new
rm -rf /var/www/snapa
mv /var/www/snapa.new /var/www/snapa
echo "deployed to /var/www/snapa"
