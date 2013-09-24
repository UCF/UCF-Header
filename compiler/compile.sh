#!/bin/bash
# Convert
set -o nounset
set -x
source compile.conf
cp src/assets/university-header-templ.js src/assets/university-header-templ.js.tmp
perl -i -ne 's/\@\!\@KEYTERMS\@\!\@/`cat src\/assets\/keyterms.json`/e;print' src/assets/university-header-templ.js.tmp
perl -i -ne 's/\@\!\@MARKUP\@\!\@/`cat src\/assets\/university-header-markup.js`/e;print' src/assets/university-header-templ.js.tmp
# perl -i -ne 's/\@\!\@GA\@\!\@/'$GA'/g' src/assets/university-header-templ.js.tmp
sed -i -e "s|@!@GA@!@|$GA|g" src/assets/university-header-templ.js.tmp
sed -i -e "s|@!@ROOT_URL@!@|$ROOT_URL|g" src/assets/university-header-templ.js.tmp
mv src/assets/university-header-templ.js.tmp ../bar/js/university-header-full.js

cp src/assets/search-proxy-templ.php src/assets/search-proxy-templ.php.tmp
sed -i -e "s|@!@SEARCH_SERVICE@!@|$SEARCH_SERVICE|g" src/assets/search-proxy-templ.php.tmp
mv src/assets/search-proxy-templ.php.tmp ../bar/data/index.php
