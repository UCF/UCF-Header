[
	'<div id="ucfhb-inner" style="display: none;">',
		'<div id="ucfhb-left">',
			'<div id="ucfhb-logo">',
				'<a href="https://www.ucf.edu">University of Central Florida</a>',
			'</div>',
			'<button id="ucfhb-mobile-toggle" aria-controls="ucfhb-right" aria-expanded="false">Toggle Mobile Menu</button>',
		'</div>',
		'<div id="ucfhb-right">',
			'<div id="ucfhb-signon">',
				'<button id="ucfhb-signon-logo" aria-controls="ucfhb-services" aria-expanded="false">UCF Sign In</button>',
				'<div id="ucfhb-services">',
					'<div>',
						'<a id="ucfhb-myucf" class="ucfhb-service" href="https://my.ucf.edu/psp/IHPROD/EMPLOYEE/EMPL/?cmd=login">myUCF</a>',
						'<a id="ucfhb-knightsmail" class="ucfhb-service" href="http://knightsemail.ucf.edu">KnightsMail</a>',
						'<a id="ucfhb-webcourses" class="ucfhb-service" href="https://webcourses.ucf.edu">Webcourses</a>',
					'</div>',
				'</div>',
			'</div>',
			'<div id="ucfhb-search">',
				'<form action="//search.ucf.edu/" data-action-url="//search.ucf.edu#?q=" data-autosearch-url="'+ ucfhbJsonpScript +'" method="get" name="ucfhb-search-form" id="ucfhb-search-form" autocomplete="off">',
          '<label for="ucfhb-search-field" id="ucfhb-search-field-label">Search UCF</label>',
          '<div id="ucfhb-search-combobox" role="combobox" aria-owns="ucfhb-search-autocomplete" aria-haspopup="listbox" aria-expanded="false">',
            '<input type="text" name="#q" id="ucfhb-search-field" placeholder="Search UCF" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" aria-autocomplete="both" aria-controls="ucfhb-search-autocomplete" />',
          '</div>',
					'<input type="submit" value="Search" id="ucfhb-search-submit" />',
				'</form>',
				'<button id="ucfhb-search-minimal" aria-controls="ucfhb-search" aria-expanded="true">Search</button>',
			'</div>',
		'</div>',
		'<ul id="ucfhb-search-autocomplete" aria-label="Select a suggestion" role="listbox"></ul>',
	'</div>'
]
