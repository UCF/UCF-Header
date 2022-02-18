#!/bin/bash
# Convert
set -o nounset
set -x
cd "$(dirname "$0")"
source config.conf
NOW=$(date +"%s")

# Find/replace content from markup template file into header template
cp assets/university-header-templ.js assets/university-header-templ.js.tmp
perl -i -ne 's/\@\!\@MARKUP\@\!\@/`cat assets\/university-header-markup.js`/e;print' assets/university-header-templ.js.tmp
# Find/replace config variables in header template
sed -i -e "s|@!@GA@!@|$GA|g" assets/university-header-templ.js.tmp
sed -i -e "s|@!@ROOT_URL@!@|$ROOT_URL|g" assets/university-header-templ.js.tmp
sed -i -e "s|@!@VERSION@!@|$NOW|g" assets/university-header-templ.js.tmp
# Save bar/js/university-header-full.js
mv assets/university-header-templ.js.tmp ../bar/js/university-header-full.js

# Minify university-header-full.js
java -jar compiler.jar --js ../bar/js/university-header-full.js --js_output_file ../bar/js/university-header.js
