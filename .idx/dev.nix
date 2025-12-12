{ pkgs, ... }: {
  # OPTIMIZATION: Upgraded to 24.05 to fix broken dependency trees
  channel = "stable-24.05";
  
  env = { 
    LANG = "C.UTF-8"; 
  };
  
  packages = [
    pkgs.gh 
    pkgs.git 
    pkgs.nodejs_20 
    pkgs.python3 
    pkgs.sqlite 
    pkgs.curl
    # OPTIMIZATION: Downgraded to 'scheme-small' to prevent build timeouts. 
    # Switch back to 'scheme-medium' only after environment is stable.
    pkgs.texlive.combined.scheme-small 
    pkgs.pdftk 
    # OPTIMIZATION: Removed 'pkgs.docker' to reduce build complexity during recovery.
  ];
  
  idx = {
    extensions = [ 
      "github.copilot" 
      "vscodevim.vim" 
      "eamodio.gitlens" 
      "james-yu.latex-workshop" 
      "ms-python.python" 
      "alexcvzz.vscode-sqlite" 
      "esbenp.prettier-vscode" 
    ];
    
    workspace = {
      onCreate = { 
        # OPTIMIZATION: Added flags for faster install and stability
        npm-install = "npm install --no-audit && (cd functions && npm install --no-audit)"; 
        git-submodules = "git submodule update --init --recursive";
        # FIX: Install LHCI via npm instead of Nix (more reliable)
        install-lhci = "npm install -g @lhci/cli";
      };
      
      onStart = { 
        node-version = "node --version"; 
        lighthouse-check = "lhci --version"; 
      };
    };
    
    previews = { 
      enable = true; 
      previews = { 
        web = { 
          command = ["npm" "run" "start"]; 
          manager = "web"; 
        }; 
      }; 
    };
  };
}
