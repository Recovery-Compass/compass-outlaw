#!/usr/bin/env bash
# Append a row to Insights_Log via your Apps Script web app.
# jq builds JSON safely; secret is retrieved from Keychain at runtime and never printed.

set -euo pipefail

# Dependencies
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required (brew install jq)" >&2; exit 1; }

# Usage: insights_append.sh "source" "subject" ["actor"="cli"] ["notes"=""] ['{"foo":"bar"}']
SOURCE=${1:?source}
SUBJECT=${2:?subject}
ACTOR=${3:-cli}
NOTES=${4:-""}
DATA_JSON=${5:-"{}"}  # pass as a valid JSON string

# Load helpers and secrets (AUTH_SECRET)
source "${HOME}/rc-docops/tools/keychain_helper.sh"
SECRET="$(get_secret)"

# Resolve WEB_APP_URL: prefer env, fallback to Keychain
if [ -z "${WEB_APP_URL:-}" ]; then
  source "${HOME}/rc-docops/tools/webapp_url_helper.sh"
  WEB_APP_URL="$(get_webapp_url)"
fi
: "${WEB_APP_URL:?Set WEB_APP_URL or store it via put_webapp_url in Keychain}" 

# Build payload safely
PAYLOAD="$(jq -c -n --arg tab "Insights_Log" \
  --arg source "$SOURCE" \
  --arg subject "$SUBJECT" \
  --arg actor "$ACTOR" \
  --arg notes "$NOTES" \
  --argjson data "$DATA_JSON" '
{
  TAB_NAME: $tab,
  source: $source,
  subject: $subject,
  actor: $actor,
  notes: $notes,
  data: $data
}')"

curl -sS --fail -X POST "${WEB_APP_URL}" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SECRET}" \
  -d "${PAYLOAD}"
echo
