# New University Header

Visit http://universityheader.ucf.edu for usage instructions and guidelines.

## Requirements
- PHP
- Python
- pip (Python package manager)
- virtualenv (Python virtual environment generator; can use pip to install--`pip install virtualenv`)

## Installation

- Clone this repository and place it in a web-accessible location.
- $ cd UCF-Header/
- $ virtualenv compiler
- $ cd compiler/
- $ source bin/activate
- $ pip install -r requirements.txt
- Update values in `compiler/src/config.templ.py` as necessary for your environment; save as `compiler/src/config.py`
- $ python src/build.py
- Load `index.html` (in repo's root directory); make sure all assets are loaded in correctly.  Purge files in cache if necessary.

## Updating Content

Do NOT update content in either of the university-header.js files in `/bar/js`. 
Update Keyterms in `compiler/src/assets/keyterms.js` and bar markup in 
`compiler/src/assets/university-header-markup.js`, then recompile.
