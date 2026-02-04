#!/usr/bin/env bash
# Prints the Doppler service token from macOS Keychain to stdout.
# Do NOT echo this value anywhere else; use in command substitution only.
set -Eeuo pipefail
ITEM_NAME="doppler_dev_rc_apis_token"
ACCOUNT_NAME="doppler-cli"
if ! security find-generic-password -a "$ACCOUNT_NAME" -s "$ITEM_NAME" >/dev/null 2>&1; then
  echo "[ERROR] Keychain item '$ITEM_NAME' (account '$ACCOUNT_NAME') not found. Add via Keychain Access." >&2
  exit 1
fi
security find-generic-password -a "$ACCOUNT_NAME" -s "$ITEM_NAME" -w 2>/dev/null
