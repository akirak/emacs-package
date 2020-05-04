{ emacs ? "snapshot",
  srcDir ? ../.,
  packageFile ? ".melpa-check/packages.dhall"
}:
import (builtins.fetchTarball "https://github.com/akirak/melpa-check/archive/v3.tar.gz") {
  inherit emacs packageFile srcDir;
}
