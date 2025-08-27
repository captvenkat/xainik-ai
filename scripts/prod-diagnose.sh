#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 https://your-domain.vercel.app"
  exit 1
fi
BASE="$1"
echo "🔎 Diagnosing $BASE"
echo

step() { echo; echo "==> $*"; }

step "Root HEAD"
curl -s -I "$BASE/" | sed -n '1,20p'

step "_vercel asset (should bypass your app entirely)"
curl -s -I "$BASE/_vercel/insights/script.js" | sed -n '1,20p'

step "__health route (should be 200 JSON if your app runs)"
curl -s -I "$BASE/__health" | sed -n '1,20p'

step "__debug/headers (shows headers your app sees)"
curl -s "$BASE/__debug/headers" | sed -n '1,80p'

echo
echo "Tip: If you see 'WWW-Authenticate: Basic realm=\"Vercel\"' or 401 on all the above,"
echo "Vercel Protection/SSO is gating requests before your app/middleware executes."
echo "Disable Protection for this domain (Vercel → Project → Settings → Protection) or authenticate."
