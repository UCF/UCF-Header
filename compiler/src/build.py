# Define bar markup, keyterms locations
# load in university-header-templ.py; find+replace all placeholder values
# save out to /bar/js/university-header-full.js
# minify; save out to /bar/js/university-header.js

import os
import json
import uglipyjs
from config import config


if __name__ == '__main__':
	script_dir = os.path.dirname(__file__)

	keyterms = open(os.path.join(script_dir, 'assets/keyterms.json'), 'r').read()
	markup = open(os.path.join(script_dir, 'assets/university-header-markup.js'), 'r').read()

	template = open(os.path.join(script_dir, 'assets/university-header-templ.js'), 'r')
	jsfull = open(os.path.join(script_dir, '../../bar/js/university-header-full.js'), 'w+')
	jsmin = open(os.path.join(script_dir, '../../bar/js/university-header.js'), 'w+')

	print "Writing university-header-full.js..."
	for line in template:
		jsfull.write(
			line.replace('@!@GA@!@', config['ga']).replace('@!@ROOT_URL@!@', config['root_url']).replace('@!@KEYTERMS@!@', keyterms).replace('@!@MARKUP@!@', markup)
		)

	template.close()
	jsfull.close()
	print "university-header-full.js saved."

	jsfulltext = open(os.path.join(script_dir, '../../bar/js/university-header-full.js'), 'r').read()

	print "Writing university-header.js..."
	jsmin.write(uglipyjs.compile(jsfulltext))

	jsfull.close()
	jsmin.close()
	print "university-header.js saved."