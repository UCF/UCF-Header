document.ready = function() {
	var barWrapper = document.getElementById('ucfhb'),
		mobileToggle = document.getElementById('ucfhb-mobile-toggle'),
		ucfLogo = document.getElementById('ucfhb-logo'),
		barRight = document.getElementById('ucfhb-right'),
		myUCFBtn = document.getElementById('ucfhb-myucf-logo'),
		myUCFWrapper = document.getElementById('ucfhb-myucf'),
		searchbar = document.getElementById('ucfhb-search'),
		searchMinimal = document.getElementById('ucfhb-search-minimal'),
		searchAutocomplete = document.getElementById('ucfhb-search-autocomplete'),

		shiftLeftElems = [myUCFBtn, searchbar, searchMinimal, searchAutocomplete],
		mobileToggleElems = [barWrapper, mobileToggle, ucfLogo, barRight];

	/* Function to toggle classes on an array of elements */
	var toggleClasses = function(elems, newClassName) {
		var length = elems.length;
		for (var i=0; i<length; i++) {
			elems[i].className = newClassName;
		}
	};


	/* MyUCF Sliding functionality */
	
	myUCFBtn.onclick = function() {
		if (myUCFBtn.className == 'ucfhb-shiftleft') {
			toggleClasses(shiftLeftElems, '');
		}
		else {
			toggleClasses(shiftLeftElems, 'ucfhb-shiftleft');
		}
	};
	searchMinimal.onclick = function() {
		toggleClasses(shiftLeftElems, '');
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