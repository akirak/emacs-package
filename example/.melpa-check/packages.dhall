let Package = (./schema.dhall).Package

in  [ Package::{
      , pname = "hello"
      , version = "0.1"
      , emacsVersion = "25.1"
      , files = [ "hello.el", "tests/hello-util.el" ]
      , dependencies = [ "dash" ]
      , mainFile = Some "hello.el"
      , recipe =
          ''
          (hello :fetcher github :repo "akirak/emacs-package"
          :files ("example/*.el"))
          ''
      }
    ]
