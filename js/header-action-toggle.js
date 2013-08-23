document.ready = function() {
	var barWrapper = document.getElementById('ucfhb'),
		mobileToggle = document.getElementById('ucfhb-mobile-toggle'),
		ucfLogo = document.getElementById('ucfhb-logo'),
		barRight = document.getElementById('ucfhb-right'),
		myUCFBtn = document.getElementById('ucfhb-signon-logo'),
		myUCFWrapper = document.getElementById('ucfhb-signon'),
		searchbar = document.getElementById('ucfhb-search'),
		searchField = document.getElementById('ucfhb-search-field'),
		searchBtn = document.getElementById('ucfhb-search-submit'),
		searchMinimal = document.getElementById('ucfhb-search-minimal'),
		searchAutocomplete = document.getElementById('ucfhb-search-autocomplete'),

		shiftLeftElems = [myUCFBtn, searchbar, searchMinimal, searchAutocomplete],
		mobileToggleElems = [barWrapper, mobileToggle, ucfLogo, barRight, searchAutocomplete];

		goldBarClass = 'ucfhb-gold';

	/* Function to toggle classes on an array of elements */
	var toggleClasses = function(elems, newClassName) {
		var length = elems.length;
		for (var i=0; i<length; i++) {
			// Maintain goldBarClass if it is assigned
			if (elems[i].className.indexOf(goldBarClass) > -1) {
				elems[i].className = goldBarClass + ' ' + newClassName;
			}
			else {
				elems[i].className = newClassName;
			}
		}
	};


	/* MyUCF Sliding functionality */
	
	myUCFBtn.onclick = function() {
		if (myUCFBtn.className == 'ucfhb-shiftleft') {
			toggleClasses(shiftLeftElems, '');
			// Re-enable tabbing for previously disabled elements
			searchField.removeAttribute('tabindex');
			searchBtn.removeAttribute('tabindex');
		}
		else {
			toggleClasses(shiftLeftElems, 'ucfhb-shiftleft');
			// Disable tabbing on hidden elements
			searchField.setAttribute('tabindex', '-1');
			searchBtn.setAttribute('tabindex', '-1');
		}
	};
	searchMinimal.onclick = function() {
		toggleClasses(shiftLeftElems, '');
		searchField.focus();
		searchField.removeAttribute('tabindex');
		searchBtn.removeAttribute('tabindex');
	};
	
	/* Mobile show/hide functionality */
	mobileToggle.onclick = function() {
		if (mobileToggle.className == 'ucfhb-mobileslide') {
			toggleClasses(mobileToggleElems, '');
		}
		else {
			toggleClasses(mobileToggleElems, 'ucfhb-mobileslide');
		}
	};
};