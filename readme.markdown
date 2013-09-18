# UCF Header v2.0.0

Visit http://universityheader.ucf.edu for usage instructions and guidelines.

## Installation

- Clone this repository and place it in a web-accessible location.
- Update index.html, line 10 `<script>` src attribute to point to your new location.
- Update absolute URLs in bar/js/university-header-full.js on lines 93, 94 and 95 
to point to your new location.
- Update same absolute URLs above in bar/js/university-header.js, or run bar/js/university-header-full.js 
thru jscompress.com and replace the file content with the minified results.
- Clear your cache if any of these files have been cached already.

## Updating Content

Currently all content, including markup and keyterms, must be updated in
university-header.js and university-header-full.js.

bar/js/university-header.js is a minified version of bar/js/university-header-full.js; 
when making updates to the bar, update bar/js/university-header-full.js first, then 
minify the updated file and paste the results into bar/js/university-header.js.

Currently, bar/html/university-header.html and bar/js/keyterms.js serve ONLY as a reference 
for the data that is included in the actual university header js files.  Updating these 
files does NOT update what appears in the bar.

## Future TODO
Update the repo to build the university header js files with a compiler!