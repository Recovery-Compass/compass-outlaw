#!/usr/bin/env bash
# Append a file entry to File_Registry: computes size, mime, absolute path, sha256 locally.
# Registry rows record custody and metadata consistently; avoids guessing values in Apps Script.

set -euo pipefail

# Dependencies
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required (brew install jq)" >&2; exit 1; }
command -v shasum >/dev/null 2>&1 || { echo "ERROR: shasum is required" >&2; exit 1; }
command -v file >/dev/null 2>&1 || { echo "ERROR: file(1) is required" >&2; exit 1; }

# Usage: file_registry_append.sh /path/to/file ["source"="local"] ["custody"="downloaded"] ["notes"=""]
FILE=${1:?file}
SOURCE=${2:-"local"}
CUSTODY=${3:-"downloaded"}
NOTES=${4:-""}

# Resolve absolute path (portable across macOS/Linux)
DIR="$(cd "$(dirname "$FILE")" && pwd)"
BASE="$(basename "$FILE")"
FULL_PATH="${DIR}/${BASE}"

# Validate file exists
if [ ! -f "$FULL_PATH" ]; then
  echo "ERROR: file not found: $FULL_PATH" >&2
  exit 1
fi

# Compute fields
SIZE="$(stat -f%z "$FULL_PATH" 2>/dev/null || stat -c%s "$FULL_PATH")"
MIME="$(file -b --mime-type "$FULL_PATH" 2>/dev/null || echo application/octet-stream)"
SHA256="$(shasum -a 256 "$FULL_PATH" | awk '{print $1}')"
LOCATION_URL="file://${FULL_PATH}"

# Load helpers and secrets (AUTH_SECRET)
source "${HOME}/rc-docops/tools/keychain_helper.sh"
SECRET="$(get_secret)"

# Resolve WEB_APP_URL: prefer env, fallback to Keychain
if [ -z "${WEB_APP_URL:-}" ]; then
  source "${HOME}/rc-docops/tools/webapp_url_helper.sh"
  WEB_APP_URL="$(get_webapp_url)"
fi
: "${WEB_APP_URL:?Set WEB_APP_URL or store it via put_webapp_url in Keychain}" 

# Build payload
PAYLOAD="$(jq -c -n --arg tab "File_Registry" \
  --arg source "$SOURCE" \
  --arg filename "$BASE" \
  --arg size_bytes "$SIZE" \
  --arg mime_type "$MIME" \
  --arg location_url "$LOCATION_URL" \
  --arg custody "$CUSTODY" \
  --arg notes "$NOTES" \
  --arg sha256 "$SHA256" '
{
  TAB_NAME: $tab,
  source: $source,
  filename: $filename,
  size_bytes: ($size_bytes|tonumber),
  mime_type: $mime_type,
  location_url: $location_url,
  custody: $custody,
  notes: $notes,
  data: { sha256: $sha256 }
}')"

curl -sS --fail -X POST "${WEB_APP_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SECRET}" \
  -d "${PAYLOAD}"
echo
