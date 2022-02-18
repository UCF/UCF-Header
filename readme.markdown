# University Header
**Visit https://universityheader.ucf.edu for usage instructions and guidelines.**

----------

## Development requirements
- Java Runtime Environment version 6 (required for Google Closure compiler application)

## Installation
- Clone this repository and place it in a web-accessible location.
- `$ cd UCF-Header/compiler/`
- If this is a first-time install, copy `config.templ.conf`, update config values as necessary for your environment, and save as `config.conf`.
- `$ ./compile.sh`
- Load `index.html` (in repo's root directory) in your browser; make sure all assets are loaded in correctly.  Purge files in cache if necessary.

## Updating Content
Do NOT update content in either of the university-header.js files in `/bar/js`.
Update bar markup in `compiler/assets/university-header-markup.js`, then recompile.

To compile and test changes to asset files, execute `$ ./compile.sh` from the `UCF-Header/compiler/` directory.
