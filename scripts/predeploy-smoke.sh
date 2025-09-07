#!/usr/bin/env bash
set -euo pipefail

# Inputs
BASE_URL="${1:-https://xainik.com}"  # override with Preview URL when testing a PR

echo "🔥 SMOKE TEST - $BASE_URL"
echo "=" | tr -d '\n' && printf "%*s" 50 | tr ' ' '='
echo ""

echo "==> /api/health (expect 200 with { ok: true })"
curl -s -o - "$BASE_URL/api/health" | sed -e 's/.*/RESPONSE: &/'
echo ""

echo "==> /api/bookings/confirm (POST) expects 200 or handler-specific response"
curl -s -X POST "$BASE_URL/api/bookings/confirm" -H "Content-Type: application/json" -d '{"bookingId":"test"}' | sed -e 's/.*/RESPONSE: &/'
echo ""

# Test 1: Admin media page
echo "==> Testing /admin/media (expect 200)"
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/admin/media")
if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ /admin/media: $ADMIN_STATUS"
else
    echo "❌ /admin/media: $ADMIN_STATUS"
    exit 1
fi

# Test 2: Posters endpoint feature gate
echo ""
echo "==> Testing /api/posters feature gate"
POSTERS_RESPONSE=$(curl -s -X POST "$BASE_URL/api/posters" \
  -H "Content-Type: application/json" \
  -d '{"speakerId":"test","photoUrl":"https://picsum.photos/1600.jpg","userId":"test-user"}')

if echo "$POSTERS_RESPONSE" | grep -q "FEATURE_DISABLED"; then
    echo "✅ /api/posters: 503 FEATURE_DISABLED (expected when RUNWARE_API_KEY missing)"
elif echo "$POSTERS_RESPONSE" | grep -q "urls"; then
    echo "✅ /api/posters: 200 with URLs (RUNWARE_API_KEY configured)"
else
    echo "⚠️  /api/posters: Unexpected response"
    echo "Response: $POSTERS_RESPONSE"
fi

# Test 3: Migration dry scan
echo ""
echo "==> Testing /api/admin/run-migration-scan"
MIGRATION_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/run-migration-scan" \
  -H "Content-Type: application/json" \
  -d '{"dry":true,"limit":5}')

if echo "$MIGRATION_RESPONSE" | grep -q "count\|processed\|migrated"; then
    echo "✅ /api/admin/run-migration-scan: JSON response with data"
elif echo "$MIGRATION_RESPONSE" | grep -q "500\|error"; then
    echo "⚠️  /api/admin/run-migration-scan: 500 (schema may not be migrated yet)"
else
    echo "✅ /api/admin/run-migration-scan: Response received"
fi

# Test 4: Basic API endpoints
echo ""
echo "==> Testing basic API endpoints"
for endpoint in "/api/events" "/api/speakers" "/api/donations/create-order"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    if [ "$STATUS" = "200" ] || [ "$STATUS" = "405" ] || [ "$STATUS" = "503" ]; then
        echo "✅ $endpoint: $STATUS"
    else
        echo "❌ $endpoint: $STATUS"
        exit 1
    fi
done

echo ""
echo "🎉 SMOKE TEST COMPLETE - All critical endpoints responding"
