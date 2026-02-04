#!/usr/bin/env bash
# webapp_url_helper.sh
# Securely store/retrieve the Apps Script Web App URL in macOS Keychain.
# This avoids storing the URL in shell history or scripts.

set -euo pipefail

# Default service name for the Keychain entry.
# Aligned to the user's confirmed Keychain entry name.
DEFAULT_SERVICE_NAME="rc.webapp.url"

# Usage: put_webapp_url "https://script.google.com/macros/s/.../exec" [service_name]
# Stores the URL in Keychain. Uses DEFAULT_SERVICE_NAME if a specific service_name is not provided.
put_webapp_url() {
  local url=${1:?"Usage: put_webapp_url <web_app_url> [service_name]"}
  local service_name=${2:-$DEFAULT_SERVICE_NAME}

  security add-generic-password \
    -a "$service_name" \
    -s "$service_name" \
    -l "Sheets Append Web App URL" \
    -w "$url" \
    -U >/dev/null

  echo "WEB_APP_URL stored in Keychain (service=$service_name)"
}

# Usage: get_webapp_url [service_name]
# Retrieves the URL from Keychain and prints it to stdout.
# Use in a subshell to capture output, e.g., URL=$(get_webapp_url).
get_webapp_url() {
  local service_name=${1:-$DEFAULT_SERVICE_NAME}

  # Redirect stderr to /dev/null to suppress errors if the item is not found.
  # The `|| true` prevents the script from exiting if the command fails (due to `set -e`).
  security find-generic-password -a "$service_name" -s "$service_name" -w 2>/dev/null || true
}

# --- Example Usage ---
#
# 1. Source the script in your terminal:
#    source ~/rc-docops/tools/webapp_url_helper.sh
#
# 2. Store the URL (only needs to be done once):
#    put_webapp_url "https://script.google.com/macros/s/your-url/exec"
#
# 3. Retrieve the URL within another script:
#    WEB_APP_URL=$(get_webapp_url)
#    if [ -z "$WEB_APP_URL" ]; then
#      echo "Error: Web App URL not found in Keychain under service name '$DEFAULT_SERVICE_NAME'." >&2
#      exit 1
#    fi
#    # Now use the $WEB_APP_URL variable in your curl commands...
