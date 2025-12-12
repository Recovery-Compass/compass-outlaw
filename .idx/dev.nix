{ pkgs, ... }: {
  # SAFETY MODE: Reverting to 23.11 and minimal packages to force a successful build.
  channel = "stable-23.11";
  
  env = { 
    LANG = "C.UTF-8"; 
  };
  
  packages = [
    pkgs.gh 
    pkgs.git 
    pkgs.nodejs_20
    pkgs.python3
    # REMOVED: texlive, pdftk, sqlite (potential build blockers)
  ];
  
  idx = {
    extensions = [ 
      "github.copilot" 
      "vscodevim.vim" 
      "esbenp.prettier-vscode" 
    ];
    
    workspace = {
      onCreate = { 
        # MINIMAL HOOKS: Only essential git setup
        git-submodules = "git submodule update --init --recursive";
      };
      
      onStart = { 
        node-version = "node --version"; 
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