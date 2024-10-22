#!/bin/bash
# Convert
set -o nounset
set -x
cd "$(dirname "$0")"
if [ -f  ../config.conf ]; then
    source ../config.conf
fi
NOW=$(date +"%s")

# Create temp files:
cp js/university-header.js js/university-header.js.tmp
cp js/university-header-full.js js/university-header-full.js.tmp

# Find/replace config variables in header templates
sed -i -e "s|@!@GA@!@|$GA|g" js/university-header.js.tmp
sed -i -e "s|@!@ROOT_URL@!@|$ROOT_URL|g" js/university-header.js.tmp
sed -i -e "s|@!@VERSION@!@|$NOW|g" js/university-header.js.tmp

sed -i -e "s|@!@GA@!@|$GA|g" js/university-header-full.js.tmp
sed -i -e "s|@!@ROOT_URL@!@|$ROOT_URL|g" js/university-header-full.js.tmp
sed -i -e "s|@!@VERSION@!@|$NOW|g" js/university-header-full.js.tmp

# Save bar/js/university-header.js
mv js/university-header.js.tmp ../bar/js/university-header.js

# Save bar/js/university-header-full.js
mv js/university-header-full.js.tmp ../bar/js/university-header-full.js
