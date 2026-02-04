#!/usr/bin/env bash
# run_e2e_now.sh — one-shot autonomous executor
# - Reads WEB_APP_URL and AUTH_SECRET from Keychain (no echo)
# - Posts 3 appends via helper scripts using Authorization: Bearer
# - Aggregates results, writes artifacts, prints single sentinel
set -euo pipefail
WEBAPP_SERVICE="${SERVICE_NAME:-khpoa-signal-router-webapp-url}"
AUTH_SERVICE="${AUTH_SERVICE_NAME:-khpoa-signal-router-auth-secret}"
WITH_URL_WRAPPER="${HOME}/rc-docops/tools/with_webapp_url.sh"
INSIGHTS_SH="${HOME}/rc-docops/tools/insights_append.sh"
FILE_REG_SH="${HOME}/rc-docops/tools/file_registry_append.sh"
DIGEST_SH="${HOME}/rc-docops/tools/digest_enqueue.sh"

# Gate: keychain entries must exist (metadata only)
security find-generic-password -a "$WEBAPP_SERVICE" -s "$WEBAPP_SERVICE" >/dev/null 2>&1 || { echo "NEEDS_INPUT: missing=[Keychain:$WEBAPP_SERVICE] reason=[WEB_APP_URL not set]"; exit 0; }
security find-generic-password -a "$AUTH_SERVICE" -s "$AUTH_SERVICE" >/dev/null 2>&1 || { echo "NEEDS_INPUT: missing=[Keychain:$AUTH_SERVICE] reason=[AUTH_SECRET not set]"; exit 0; }

# Run three appends and collect outputs without printing secrets
okc=0; hashc=0; evid=()
run_and_collect() {
  local name="$1"; shift
  set +e
  OUT="$($WITH_URL_WRAPPER "$@" 2>&1)"; RC=$?
  set -e
  # If JSON, parse ok and optional id
  local ok=false
  if printf '%s' "$OUT" | jq -e . >/dev/null 2>&1; then
    val=$(printf '%s' "$OUT" | jq -r 'try .ok // false')
    [ "$val" = "true" ] && ok=true
    id=$(printf '%s' "$OUT" | jq -r 'try (.id // .row_id // .log_id) catch ""')
    [ -n "$id" ] && [ "$id" != "null" ] && evid+=("$id")
    # custody/hash hint
    if printf '%s' "$OUT" | jq -er 'try (.data.sha256 // empty) | length > 0' >/dev/null 2>&1; then
      hashc=$((hashc+1))
    fi
  fi
  [ "$ok" = true ] && okc=$((okc+1))
  printf '%s' "$OUT"
}

# 1) Insights_Log
INS_PAY='{"ok":true,"mode":"autonomous"}'
INS_OUT=$(run_and_collect insights "$INSIGHTS_SH" "warp" "autonomous-smoke" "executor" "bearer" "$INS_PAY")
# 2) File_Registry — register insights script
FILE_OUT=$(run_and_collect file_registry "$FILE_REG_SH" "$INSIGHTS_SH" "warp" "autonomous" "registry-smoke")
# 3) Digest_Queue
ITEMS='[{"id":"auto-1"}]'
DIG_OUT=$(run_and_collect digest "$DIGEST_SH" "warp" "autonomous-digest" "normal" "" "$ITEMS")

# Artifacts
TS=$(date +%Y%m%d%H%M%S)
OUT_JSON="${HOME}/Downloads/rc-smoke-${TS}.json"
OUT_TXT="${HOME}/Downloads/rc-smoke-${TS}.txt"

jq -n \
  --argjson okI "$(printf '%s' "$INS_OUT" | jq -r 'try .ok // false')" \
  --argjson okF "$(printf '%s' "$FILE_OUT" | jq -r 'try .ok // false')" \
  --argjson okD "$(printf '%s' "$DIG_OUT" | jq -r 'try .ok // false')" \
  --arg ins "$INS_OUT" \
  --arg fil "$FILE_OUT" \
  --arg dig "$DIG_OUT" \
  --arg rows "$okc" \
  --arg hashes "$hashc" \
  '{insights:{ok:$okI,raw:$ins},file_registry:{ok:$okF,raw:$fil},digest:{ok:$okD,raw:$dig},rows_appended:($rows|tonumber),hashes_verified:($hashes|tonumber)}' > "$OUT_JSON"

{
  echo "RC Smoke Test Summary ($TS)"
  echo "rows_appended=$okc, hashes_verified=$hashc"
} > "$OUT_TXT"

# Optional PDF if venv present
PDF_PATH=""
if [ -x "${HOME}/rc-docops/venv-rc/bin/python" ]; then
  PDF_PATH="${HOME}/Downloads/rc-smoke-${TS}.pdf"
  set +e
  "${HOME}/rc-docops/venv-rc/bin/python" - <<PY >/dev/null 2>&1
from reportlab.lib.pagesizes import LETTER
from reportlab.pdfgen import canvas
import json, os
summary_path = os.path.expanduser("$OUT_JSON")
pdf_path = os.path.expanduser("$PDF_PATH")
with open(summary_path) as f:
    data = json.load(f)
c = canvas.Canvas(pdf_path, pagesize=LETTER)
w, h = LETTER
y = h - 72
c.setFont("Helvetica-Bold", 14)
c.drawString(72, y, "RC Smoke Test Summary")
y -= 24
c.setFont("Helvetica", 10)
for line in json.dumps(data, indent=2).splitlines():
    if y < 72:
        c.showPage(); y = h - 72; c.setFont("Helvetica", 10)
    c.drawString(72, y, line[:95])
    y -= 12
c.save()
PY
  set -e
fi

# State marker
STATE_DIR="${HOME}/rc-docops/state"
mkdir -p "$STATE_DIR"
MARKER="$STATE_DIR/wfd-webapp.success"
[ "$okc" -ge 3 ] && printf '%s\n' "$TS" > "$MARKER" || true

# Sentinel
if [ "$okc" -ge 3 ]; then
  printf 'SUCCESS: paths=[%s, %s%s] metrics=[rows_appended:%d, hashes_verified:%d, triggers_set:0] evidence=[%s]\n' \
    "$OUT_JSON" "$OUT_TXT" "${PDF_PATH:+, $PDF_PATH}" "$okc" "$hashc" "${evid[*]}"
else
  printf 'NEEDS_INPUT: missing=[AppsScriptEndpointOrSchemas] reason=[headless POST not acknowledged ok:true] paths=[%s, %s%s] metrics=[rows_appended:%d,hashes_verified:%d,triggers_set:0] evidence=[%s]\n' \
    "$OUT_JSON" "$OUT_TXT" "${PDF_PATH:+, $PDF_PATH}" "$okc" "$hashc" "${evid[*]}"
fi
