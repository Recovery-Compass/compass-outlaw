#!/usr/bin/env bash
# alignment_gate.sh
# Purpose: Validate and, if available in a local secrets file, store WEB_APP_URL and AUTH_SECRET in Keychain
# without printing their values; then run the autonomous end-to-end smoke tests. Emits a single sentinel.

set -euo pipefail

SECRETS_PATH="${SECRETS_PATH:-$HOME/Library/CloudStorage/OneDrive-Personal/baby-pops/os/warp/api keys/Apps Script/wfd-signal-insights_secrets.txt}"
WEBAPP_SERVICE="${SERVICE_NAME:-khpoa-signal-router-webapp-url}"
AUTH_SERVICE="${AUTH_SERVICE_NAME:-khpoa-signal-router-auth-secret}"

WEBAPP_HELPER="$HOME/rc-docops/tools/webapp_url_helper.sh"
KEYCHAIN_HELPER="$HOME/rc-docops/tools/keychain_helper.sh"
AUTON_EXEC="$HOME/rc-docops/tools/autonomous_end_to_end.sh"

# Verify required helpers exist
for f in "$WEBAPP_HELPER" "$KEYCHAIN_HELPER" "$AUTON_EXEC"; do
  if [ ! -f "$f" ]; then
    echo "NEEDS_INPUT: missing=[\"$f\"] reason=[\"helper/executor not found\"]"; exit 1
  fi
done

# Load helpers (no echo of secrets)
# shellcheck disable=SC1090
source "$WEBAPP_HELPER"
# shellcheck disable=SC1090
source "$KEYCHAIN_HELPER"

# Read secrets file keys (no values printed)
if [ ! -f "$SECRETS_PATH" ]; then
  echo "NEEDS_INPUT: missing=[\"$SECRETS_PATH\"] reason=[\"secrets file not found\"]"; exit 1
fi

# Parse KEY=VALUE pairs; capture only if defined
FILE_WEB_APP_URL=""
FILE_AUTH_SECRET=""
# Use POSIX-safe parsing; trim surrounding quotes
while IFS= read -r line || [ -n "$line" ]; do
  # strip comments
  case "$line" in 
    \#*|\;*|""|" ") continue;;
  esac
  # normalize
  key="${line%%=*}"
  val="${line#*=}"
  # trim
  key="$(printf '%s' "$key" | sed -e 's/^\s\+//' -e 's/\s\+$//')"
  val="$(printf '%s' "$val" | sed -e 's/^\s\+//' -e 's/\s\+$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
  [ -z "$key" ] && continue
  if [ "$key" = "WEB_APP_URL" ] && [ -z "$FILE_WEB_APP_URL" ]; then FILE_WEB_APP_URL="$val"; fi
  if [ "$key" = "AUTH_SECRET" ] && [ -z "$FILE_AUTH_SECRET" ]; then FILE_AUTH_SECRET="$val"; fi
done < "$SECRETS_PATH"

# Check Keychain presence (do not print values)
WEBAPP_PRESENT=false
AUTH_PRESENT=false
if security find-generic-password -a "$WEBAPP_SERVICE" -s "$WEBAPP_SERVICE" >/dev/null 2>&1; then WEBAPP_PRESENT=true; fi
if security find-generic-password -a "$AUTH_SERVICE" -s "$AUTH_SERVICE" >/dev/null 2>&1; then AUTH_PRESENT=true; fi

# Store from file if missing
if [ "$WEBAPP_PRESENT" = false ] && [ -n "${FILE_WEB_APP_URL:-}" ]; then
  put_webapp_url "$FILE_WEB_APP_URL" >/dev/null
  WEBAPP_PRESENT=true
fi
if [ "$AUTH_PRESENT" = false ] && [ -n "${FILE_AUTH_SECRET:-}" ]; then
  put_secret "$FILE_AUTH_SECRET" >/dev/null
  AUTH_PRESENT=true
fi

# Gate: require URL at minimum
if [ "$WEBAPP_PRESENT" = false ]; then
  echo "NEEDS_INPUT: missing=[\"WEB_APP_URL in Keychain\"] reason=[\"not found and not present in file\"]"; exit 1
fi

# Run autonomous executor (no prompts)
chmod +x "$AUTON_EXEC" || true
SENTINEL_OUTPUT="$("$AUTON_EXEC" 2>&1 || true)"

# Emit the executor's sentinel verbatim (single line expected)
printf '%s\n' "$SENTINEL_OUTPUT"
