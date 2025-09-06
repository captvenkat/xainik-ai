#!/usr/bin/env bash
set -euo pipefail

# Inputs
BASE_URL="${1:-https://xainik.com}"  # override with Preview URL when testing a PR

echo "==> Hitting $BASE_URL/admin/media (expect 200)"
curl -s -o /dev/null -w "%{http_code}\n" "$BASE_URL/admin/media"

echo "==> Posters endpoint feature-gate check (expect 200 with urls, or 503 FEATURE_DISABLED if key/flag off)"
curl -s -X POST "$BASE_URL/api/posters" -H "Content-Type: application/json" \
  -d '{"speakerId":"test","photoUrl":"https://picsum.photos/1600.jpg","userId":"test-user"}' | sed -e 's/.*/RESPONSE: &/'

echo "==> Migration DRY scan (expect JSON; may be 500 if DB schema not yet migrated on target)"
curl -s -X POST "$BASE_URL/api/admin/run-migration-scan" -H "Content-Type: application/json" \
  -d '{"dry":true,"limit":5}' | sed -e 's/.*/RESPONSE: &/'

echo "Smoke complete."
