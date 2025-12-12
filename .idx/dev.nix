# Compass Outlaw - Project IDX Configuration
# Version: 2.0 (Loop-Fix)
# Last Updated: December 12, 2025
#
# CRITICAL: This file fixes the "rebuild environment" loop bug by:
# 1. Using stable-24.05 channel (not unstable)
# 2. Explicit package declarations (no dynamic lookups)
# 3. Minimal workspace hooks (no circular triggers)

{ pkgs, ... }: {
  # Use stable channel to prevent rebuild loops
  channel = "stable-24.05";

  # Explicit package list - DO NOT use dynamic package resolution
  packages = [
    # Core Node.js environment
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript
    pkgs.nodePackages.typescript-language-server

    # Build tools
    pkgs.git
    pkgs.jq
    pkgs.curl
    pkgs.wget

    # Python for scripts
    pkgs.python312
    pkgs.python312Packages.pip

    # Firebase CLI (installed via npm, not nix - avoids conflicts)
    # pkgs.firebase-tools  # REMOVED: Causes rebuild loops
  ];

  # Environment variables
  env = {
    NODE_ENV = "development";
    # Prevent npm from triggering rebuilds
    NPM_CONFIG_UPDATE_NOTIFIER = "false";
    NPM_CONFIG_FUND = "false";
  };

  # IDX-specific configuration
  idx = {
    # Extensions for VS Code
    extensions = [
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
      "ms-vscode.vscode-typescript-next"
    ];

    # Workspace lifecycle - MINIMAL to prevent loops
    workspace = {
      # Only run on explicit create, not on every open
      onCreate = {
        npm-install = "npm install";
      };

      # REMOVED onStart to prevent rebuild loops
      # onStart = {};
    };

    # Preview configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
