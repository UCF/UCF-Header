# New University Header

Visit http://universityheader.ucf.edu for usage instructions and guidelines.

## Requirements
- PHP
- Java Runtime Environment version 6 (required for Google Closure compiler application)

## Installation

- Clone this repository and place it in a web-accessible location.
- `$ cd UCF-Header/compiler/`
- If this is a first-time install, copy `config.templ.conf`, update config values as necessary for your environment, and save as `config.conf`.
- `$ ./compile.sh`
- Load `index.html` (in repo's root directory) in your browser; make sure all assets are loaded in correctly.  Purge files in cache if necessary.

## Updating Content

Do NOT update content in either of the university-header.js files in `/bar/js`. 
Update keyterms in `compiler/assets/keyterms.js` and bar markup in 
`compiler/assets/university-header-markup.js`, then recompile.

*Note:  When updating keyterms, check to make sure the json file is completely valid.  Run the entire file through jsonlint.com.
Broken json will cause the compiler to fail.*

To compile and test changes to asset files, ssh into your environment and execute `$ ./compile.sh` from the `UCF-Header/compiler/` directory.