#!/usr/bin/env bash
# with_webapp_url.sh
# Wrapper: fetch WEB_APP_URL from Keychain and exec the given command with WEB_APP_URL exported.

set -euo pipefail

source "${HOME}/rc-docops/tools/webapp_url_helper.sh"
WEB_APP_URL="$(get_webapp_url)"
export WEB_APP_URL

# Usage: with_webapp_url.sh <command> [args...]
exec "$@"
