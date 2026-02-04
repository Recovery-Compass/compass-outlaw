#!/usr/bin/env bash
# Append an item to Digest_Queue with optional due date and items array.

set -euo pipefail

# Dependencies
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required (brew install jq)" >&2; exit 1; }

# Usage: digest_enqueue.sh "source" "topic" ["priority"="normal"] ["due_date"=""] '[{"id":1}]'
SOURCE=${1:?source}
TOPIC=${2:?topic}
PRIORITY=${3:-"normal"}
DUE=${4:-""}
ITEMS=${5:-"[]"}

# Load helpers and secrets (AUTH_SECRET)
source "${HOME}/rc-docops/tools/keychain_helper.sh"
SECRET="$(get_secret)"

# Resolve WEB_APP_URL: prefer env, fallback to Keychain
if [ -z "${WEB_APP_URL:-}" ]; then
  source "${HOME}/rc-docops/tools/webapp_url_helper.sh"
  WEB_APP_URL="$(get_webapp_url)"
fi
: "${WEB_APP_URL:?Set WEB_APP_URL or store it via put_webapp_url in Keychain}" 

PAYLOAD="$(jq -c -n --arg tab "Digest_Queue" \
  --arg source "$SOURCE" \
  --arg topic "$TOPIC" \
  --arg priority "$PRIORITY" \
  --arg due_date "$DUE" \
  --argjson items "$ITEMS" '
{
  TAB_NAME: $tab,
  source: $source,
  topic: $topic,
  priority: $priority,
  due_date: $due_date,
  data: $items
}')"

curl -sS --fail -X POST "${WEB_APP_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SECRET}" \
  -d "${PAYLOAD}"
echo
