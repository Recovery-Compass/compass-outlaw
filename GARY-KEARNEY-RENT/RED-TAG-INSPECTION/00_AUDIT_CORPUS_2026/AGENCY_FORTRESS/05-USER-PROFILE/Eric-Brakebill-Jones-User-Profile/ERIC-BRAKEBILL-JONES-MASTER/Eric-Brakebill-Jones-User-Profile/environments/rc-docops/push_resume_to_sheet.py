#!/usr/bin/env python3
import argparse
import datetime
import json
import os
import subprocess
import sys
from pathlib import Path

import gspread
from google.oauth2.service_account import Credentials as SACredentials
from google.oauth2.credentials import Credentials as UserCredentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import google.auth as google_auth

KEYCHAIN_SERVICE = "com.recoverycompass.gsa"
KEYCHAIN_ACCOUNT = "google-sheets-sa"


def keychain_get(service: str, account: str) -> str:
    try:
        # Capture secret from Keychain without printing it.
        proc = subprocess.run(
            [
                "security",
                "find-generic-password",
                "-s",
                service,
                "-a",
                account,
                "-w",
            ],
            check=True,
            capture_output=True,
            text=True,
        )
        return proc.stdout
    except subprocess.CalledProcessError:
        print(
            "Error: Could not retrieve service account JSON from Keychain. "
            f"Ensure item exists with service='{service}', account='{account}'.",
            file=sys.stderr,
        )
        sys.exit(1)


def _get_scopes() -> list[str]:
    return [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
    ]


def _get_user_credentials(oauth_client_file: Path | None, token_path: Path) -> UserCredentials:
    scopes = _get_scopes()
    creds: UserCredentials | None = None
    # 1) Try existing token file
    if token_path.exists():
        try:
            creds = UserCredentials.from_authorized_user_file(str(token_path), scopes=scopes)
        except Exception:
            creds = None
    if creds and creds.valid:
        return creds
    if creds and creds.expired and creds.refresh_token:
        try:
            creds.refresh(Request())
            token_path.parent.mkdir(parents=True, exist_ok=True)
            token_path.write_text(creds.to_json(), encoding="utf-8")
            return creds
        except Exception:
            pass
    # 2) If no client file provided, fall back to Application Default Credentials (gcloud ADC)
    if oauth_client_file is None:
        creds, _ = google_auth.default(scopes=scopes)
        if not creds.valid:
            try:
                creds.refresh(Request())
            except Exception:
                pass
        return creds
    # 3) Otherwise, run installed-app OAuth flow with provided client file
    flow = InstalledAppFlow.from_client_secrets_file(str(oauth_client_file), scopes=scopes)
    creds = flow.run_local_server(port=0)
    token_path.parent.mkdir(parents=True, exist_ok=True)
    token_path.write_text(creds.to_json(), encoding="utf-8")
    return creds


def _get_service_account_credentials() -> SACredentials:
    # Prefer environment variables (one-shot) before Keychain
    sa_json_env = os.environ.get("GSPREAD_SA_JSON")
    sa_keyfile_env = os.environ.get("GSPREAD_SA_KEYFILE")

    if sa_json_env:
        sa_json_str = sa_json_env
    elif sa_keyfile_env:
        try:
            return SACredentials.from_service_account_file(sa_keyfile_env, scopes=_get_scopes())
        except Exception as e:
            print(f"Error: could not read key file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        sa_json_str = keychain_get(KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT)

    # Attempt raw JSON first; if that fails, try base64-decoded JSON.
    try:
        sa_info = json.loads(sa_json_str)
    except json.JSONDecodeError:
        import base64
        try:
            decoded = base64.b64decode(sa_json_str.strip())
            sa_info = json.loads(decoded.decode("utf-8"))
        except Exception:
            print("Error: credentials are not valid JSON (raw or base64).", file=sys.stderr)
            sys.exit(1)

    creds = SACredentials.from_service_account_info(sa_info, scopes=_get_scopes())
    return creds


def create_and_populate(file_path: Path, title: str, share_email: str | None, auth_mode: str, oauth_client_file: Path | None, token_file: Path | None) -> None:
    if auth_mode == "user":
        # Use installed-app OAuth if a client file is provided; otherwise fall back to ADC (gcloud) in _get_user_credentials
        tf = token_file or Path.home() / "rc-docops" / "oauth-token.json"
        creds = _get_user_credentials(oauth_client_file, tf)
    else:
        creds = _get_service_account_credentials()

    gc = gspread.authorize(creds)

    # Create the spreadsheet
    sh = gc.create(title)

    # Write entire file into cell A1
    ws = sh.sheet1
    content = file_path.read_text(encoding="utf-8")
    ws.update("A1", [[content]])
    try:
        ws.format("A1", {"wrapStrategy": "WRAP", "verticalAlignment": "TOP"})
    except Exception:
        pass  # formatting is best-effort

    # Optional: share so it appears in your Drive ("Shared with me")
    if share_email:
        try:
            sh.share(
                share_email,
                perm_type="user",
                role="writer",
                notify=True,
                emailMessage="Automated share from one-shot script.",
            )
        except Exception as e:
            print(f"Warning: failed to share with {share_email}: {e}", file=sys.stderr)

    # Safe output: only metadata, never secrets
    print("Sheet created successfully.")
    print(f"Title: {sh.title}")
    print(f"URL:   {sh.url}")


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Create a Google Sheet and populate it from a local file using either a "
            "service account (Keychain/env) or your Google user via OAuth."
        )
    )
    parser.add_argument(
        "--file",
        default="/Users/ericjones/Desktop/Resume Prompt.md",
        help="Path to the source Markdown/text file.",
    )
    parser.add_argument(
        "--title",
        default=f"Resume Prompt - {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}",
        help="Title for the new Google Sheet.",
    )
    parser.add_argument(
        "--share",
        default=None,
        help="Optional: email address to share the new sheet with (writer).",
    )
    parser.add_argument(
        "--auth",
        choices=["sa", "user"],
        default="sa",
        help="Authentication mode: 'sa' for service account (default), 'user' for OAuth.",
    )
    parser.add_argument(
        "--oauth-client-file",
        default=None,
        help="Path to OAuth client JSON (required if --auth user)",
    )
    parser.add_argument(
        "--token-file",
        default=str(Path.home() / "rc-docops" / "oauth-token.json"),
        help="Path to store OAuth token (default: ~/rc-docops/oauth-token.json)",
    )
    args = parser.parse_args()

    src = Path(args.file).expanduser()
    if not src.exists():
        print(f"Error: source file not found: {src}", file=sys.stderr)
        sys.exit(1)

    oauth_client_path = Path(args.oauth_client_file).expanduser() if args.oauth_client_file else None
    token_path = Path(args.token_file).expanduser() if args.token_file else None

    create_and_populate(src, args.title, args.share, args.auth, oauth_client_path, token_path)


if __name__ == "__main__":
    main()
