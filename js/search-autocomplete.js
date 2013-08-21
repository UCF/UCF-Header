/**
 * Make <IE9 behave (indexOf, match, trim, JSON parsing functionality).
 *
 * Uses Douglas Crockford's json2.js parser, MDN's Array.indexOf
 * and Array.match compatibility fixes, and .trim fix here:
 * http://stackoverflow.com/questions/2308134/ 
 **/
if(!Array.prototype.indexOf){Array.prototype.indexOf=function(e){"use strict";if(this==null){throw new TypeError}var t,n,r=Object(this),i=r.length>>>0;if(i===0){return-1}t=0;if(arguments.length>1){t=Number(arguments[1]);if(t!=t){t=0}else if(t!=0&&t!=Infinity&&t!=-Infinity){t=(t>0||-1)*Math.floor(Math.abs(t))}}if(t>=i){return-1}for(n=t>=0?t:Math.max(i-Math.abs(t),0);n<i;n++){if(n in r&&r[n]===e){return n}}return-1}}if(typeof String.prototype.trim!=="function"){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}}if(typeof JSON!=="object"){JSON={}}(function(){"use strict";function f(e){return e<10?"0"+e:e}function quote(e){escapable.lastIndex=0;return escapable.test(e)?'"'+e.replace(escapable,function(e){var t=meta[e];return typeof t==="string"?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var n,r,i,s,o=gap,u,a=t[e];if(a&&typeof a==="object"&&typeof a.toJSON==="function"){a=a.toJSON(e)}if(typeof rep==="function"){a=rep.call(t,e,a)}switch(typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a){return"null"}gap+=indent;u=[];if(Object.prototype.toString.apply(a)==="[object Array]"){s=a.length;for(n=0;n<s;n+=1){u[n]=str(n,a)||"null"}i=u.length===0?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+o+"]":"["+u.join(",")+"]";gap=o;return i}if(rep&&typeof rep==="object"){s=rep.length;for(n=0;n<s;n+=1){if(typeof rep[n]==="string"){r=rep[n];i=str(r,a);if(i){u.push(quote(r)+(gap?": ":":")+i)}}}}else{for(r in a){if(Object.prototype.hasOwnProperty.call(a,r)){i=str(r,a);if(i){u.push(quote(r)+(gap?": ":":")+i)}}}}i=u.length===0?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+o+"}":"{"+u.join(",")+"}";gap=o;return i}}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(e,t,n){var r;gap="";indent="";if(typeof n==="number"){for(r=0;r<n;r+=1){indent+=" "}}else if(typeof n==="string"){indent=n}rep=t;if(t&&typeof t!=="function"&&(typeof t!=="object"||typeof t.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":e})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(e,t){var n,r,i=e[t];if(i&&typeof i==="object"){for(n in i){if(Object.prototype.hasOwnProperty.call(i,n)){r=walk(i,n);if(r!==undefined){i[n]=r}else{delete i[n]}}}}return reviver.call(e,t,i)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})()

/**
 * University Header Auto-Suggest Search Result functionality 
 **/
function autocomplete(acCloseBtn, acHelp, acList, searchForm, searchField, searchService, searchAction) {
	var self = this;

	this.autocompleteCloseBtn	= acCloseBtn;				// <a> element in corner of autocomplete results
	this.autocompleteHelp		= acHelp;					// Help text for screenreaders
	this.autocompleteList		= acList;					// Autocomplete <ul> element
	this.searchForm				= searchForm;				// Search <form> element
	this.searchField			= searchField;				// Search <input> element
	this.searchService			= searchService;			// URL of the search service queried for autocomplete results (URL to UCF search service)
	this.searchAction			= searchAction;				// 'data-action-url' attr of search <form> element; should match form 'action' attr. (URL to Google Search Appliance)
	this.keyterms				= null;						// JSON populated by self.getKeytermList
	this.keytermsUrl			= '../js/keyterms.json';	// URL of JSON object of keyterms

	var timer;	// setTimeout timer value used by self.searchOnKeyUp


	// Load in a search query via Ajax (private):  
	function loadSearchContent(url, callback) {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = ensureReadiness;
	
		function ensureReadiness() {
			if(xhr.readyState < 4) {
				return;
			}
			if(xhr.status !== 200) {
				return;
			}
			// all is well
			if(xhr.readyState === 4) {
				callback(xhr);
			}
		}
 
		xhr.open('GET', url, true);
		xhr.send('');
	}

	// Iterate through objects within an object (private)
	// http://stackoverflow.com/questions/3529509/
	function countObjectProperties(obj) {
		var count = 0;
		for(var i in obj) {
			if(obj.hasOwnProperty(i)) {
				count++;
			}
		}
		return count;
	}

	// Strip HTML tags from a string.
	function stripTags(str) {
		return str.replace(/(<([^>]+)>)/ig, '');
	}

	// Delete existing results in an autocomplete list
	this.clearAutocompleteResults = function() {
		while (self.autocompleteList.hasChildNodes()) {
			self.autocompleteList.removeChild(self.autocompleteList.lastChild);
		}
	};

	// Show/hide the autocomplete list and adjust ARIA landmarks as necessary
	this.toggleAutocompleteList = function(toggleVal) {
		if (toggleVal === true) {
			self.autocompleteList.className = 'search-is-active';
			self.autocompleteList.setAttribute('aria-hidden', 'false');
		}
		else {
			self.autocompleteList.className = '';
			self.autocompleteList.setAttribute('aria-hidden', 'true');
		}
	};

	// Update the autocomplete help text for screenreaders
	this.updateAutocompleteHelp = function(resultCount, q) {
		var helpText = '';
		if (resultCount === 0 && q === null) {
			helpText = 'Search field is empty.';
		}
		else {
			helpText = resultCount;
			if (resultCount === 1) {
				helpText += ' suggestion found';
			}
			else {
				helpText += ' suggestions found';
			}

			if (q !== null) {
				helpText += ' for "' + q + '"';
			}

			if (resultCount > 0) {
				helpText += '. Use up and down arrow keys to select a suggestion.';
			}
		}
		self.autocompleteHelp.innerHTML = helpText;
	};
	
	// Debug feed load:
	//loadSearchContent(query, function(xhr) {  
	//	console.log(xhr.responseHTML);  
	//}); 

	// List of keyterms for faster search matching 
	this.getKeytermList = function() {
		loadSearchContent(this.keytermsUrl, function(xhr) {
			self.keyterms = JSON.parse(xhr.responseText);
		});
	};
	
	// Output a search query's results:
	this.outputResults = function(q, url) {
		var safeq = stripTags(q),				// Query with tags stripped
			matchq = safeq.toLowerCase();		// Query made lowercase for matching against JSON vals
			urlq = encodeURIComponent(safeq);	// URL-safe Query

		// First, clear existing results
		self.clearAutocompleteResults();
		
		// Make sure there is actually a query to search for
		if (safeq !== '') {

			// Search against keyterm list first.
			if (self.keyterms.terms) {
				i = 0;
				var terms = self.keyterms.terms,
					matches = self.keyterms.matches,
					matchesFound = 0;

				for (i = 0; i < countObjectProperties(terms); i++) {
					var termKey = "t_" + (i + 1),
						matchKey = "m_" + (i + 1);

					if (terms[termKey].indexOf(matchq) > -1) {
						matchesFound++;
						self.toggleAutocompleteList(true);

						var name = matches[matchKey].name !== null ? stripTags(matches[matchKey].name.trim()) : '',
							nameSpan = '<span class="ucfhb-search-autocomplete-name">' + name + '</span>',
							resultUrl = matches[matchKey].url !== '' ? stripTags(matches[matchKey].url.trim()) : self.searchAction + urlq;

						var listItem = document.createElement('li');
						listItem.innerHTML = '<a href="' + resultUrl + '" tabindex="0">' + nameSpan + '</a>';
						listItem.setAttribute('data-name-val', name);

						if (terms[termKey][i] !== safeq) {
							self.autocompleteList.insertBefore(listItem, self.autocompleteList.firstChild);
						}
						else {
							self.autocompleteList.appendChild(listItem);
						}
					}
				}

				if (matchesFound > 0) {
					// Add 'View More Results link'
					var viewMoreLi = document.createElement('li');
					var viewMoreLink = self.searchAction + urlq;
					viewMoreLi.innerHTML = '<a href="' + viewMoreLink + '" tabindex="0">View More Results &raquo;</a>';
					viewMoreLi.id = 'ucfhb-search-autocomplete-more';
					viewMoreLi.setAttribute('data-name-val', safeq);
					self.autocompleteList.appendChild(viewMoreLi);
					// Update Screenreader help text
					self.updateAutocompleteHelp(matchesFound, safeq);
				}
				// Try search service results if no keyterms are found
				else {
					loadSearchContent(url, function(xhr) {
						var json = JSON.parse(xhr.responseText);
						// If data was returned, append the results to the
						// autocomplete <ul>
						if (json.results !== null && json.results.length > 0) {
							self.toggleAutocompleteList(true);
							i = 0;
							for (i = 0; i < json.results.length; i++) {
								matchesFound++;

								var name = json.results[i].name !== null ? stripTags(json.results[i].name.trim()) : '',
									nameSpan = '<span class="ucfhb-search-autocomplete-name">' + name + '</span>',
									orgSpan = json.results[i].organization !== null ? '<span class="ucfhb-search-autocomplete-org">' + stripTags(json.results[i].organization.trim()) + '</span>' : '',
									resultUrl = self.searchAction + encodeURIComponent(name);
									
								var listItem = document.createElement('li');
								listItem.innerHTML = '<a href="' + resultUrl + '" tabindex="0">' + nameSpan + orgSpan + '</a>';
								listItem.setAttribute('data-name-val', name);
								self.autocompleteList.appendChild(listItem);
							}
							// Add 'View More Results link'
							var viewMoreLi = document.createElement('li');
							var viewMoreLink = self.searchAction + urlq;
							viewMoreLi.innerHTML = '<a href="' + viewMoreLink + '" tabindex="0">View More Results &raquo;</a>';
							viewMoreLi.id = 'ucfhb-search-autocomplete-more';
							viewMoreLi.setAttribute('data-name-val', safeq);
							self.autocompleteList.appendChild(viewMoreLi);
							// Update Screenreader help text
							self.updateAutocompleteHelp(matchesFound, safeq);
						}
						else {
							// Make sure we hide the list if it's already visible and no
							// results are returned
							self.toggleAutocompleteList(false);
							self.updateAutocompleteHelp(0, safeq);
						}
					});
				}
			}

		}
		// If there is no query, make sure the autocomplete
		// list is not visible
		else {
			self.toggleAutocompleteList(false);
			self.updateAutocompleteHelp(0, null);
		}
	};

	// Navigate an autocomplete <ul>'s list items with up- and
	// down-arrow keystrokes
	this.acListKeystrokeSelect = function(keycode) {
		var list = self.autocompleteList,
			listFirstChild = list.firstChild,
			listLastChild = list.lastChild,
			selectedClass = 'ucfhb-autocomplete-selected',
			selectedLi = null;
		if (document.getElementsByClassName(selectedClass)[0]) {
			selectedLi = document.getElementsByClassName(selectedClass)[0];
		}
		else {
			selectedLi = listFirstChild;
		}

		// Function to 'select' a list item in an autocomplete list
		var selectNewResult = function(oldLi, newLi, defaultLi) {
			var newSearchVal = '';

			// Unset any previously set classes
			oldLi.className = '';
			listFirstChild.className = '';
			listLastChild.className = '';

			// previous/nextSibling returns null when sibling is not found
			if (newLi !== null) {
				defaultLi.className = '';
				newLi.className = selectedClass;
				newSearchVal = newLi.getAttribute('data-name-val');
			}
			else {
				defaultLi.className = selectedClass;
				newSearchVal = defaultLi.getAttribute('data-name-val');
			}

			// Assign new search field value
			self.searchField.value = newSearchVal;

			// Simulate a right-arrow keystroke to force a re-read of 
			// search field val for screenreaders
			// http://stackoverflow.com/questions/596481/
			var srEvent = document.createEvent('KeyboardEvent');
			var initMethod = typeof srEvent.initKeyboardEvent !== 'undefined' ? 'initKeyboardEvent' : 'initKeyEvent';
			srEvent[initMethod](
               'keydown', // event type : keydown, keyup, keypress
                true, // bubbles
                true, // cancelable
                window, // viewArg: should be window
                false, // ctrlKeyArg
                false, // altKeyArg
                false, // shiftKeyArg
                false, // metaKeyArg
                39, // keyCodeArg : unsigned long the virtual key code, else 0
                0 // charCodeArgs : unsigned long the Unicode character associated with the depressed key, else 0
			);
			document.dispatchEvent(srEvent);
		};

		if (list.className == 'search-is-active' && document.activeElement == self.searchField) {
			// Detect an up/down keypress (when search field is focused + autocomplete is visible)
			if (keycode == 40) {
				// Move down one list item. Check if a list item is highlighted yet or not
				var listNextSibling = null;
				if (document.getElementsByClassName(selectedClass)[0]) {
					listNextSibling = selectedLi.nextSibling;
				}
				else {
					listNextSibling = listFirstChild;
				}
				selectNewResult(selectedLi, listNextSibling, listFirstChild);
			}
			else if (keycode == 38) {
				// Move up one list item
				var listPrevSibling = selectedLi.previousSibling;
				selectNewResult(selectedLi, listPrevSibling, listLastChild);
			}
			else if (keycode == 39 || keycode == 37) {
				// Left or right arrow keypress; do nothing
				return;
			}
		}
	};
	
	// Perform outputResults() when a query is
	// being typed in the search bar:
	this.searchOnKeyUp = function(searchService, q, query) {
		clearTimeout(timer);
		timer = setTimeout(function () {
			self.outputResults(q, query);
		}, 600);
	};
	
	// On load + listen for events
	this.initialize = function() {
		// Retrieve the keyterm list on load
		self.getKeytermList();
		// Handle the onkeyup event for autosearching:
		self.searchForm.onkeyup = function(e) {
			var q = stripTags(self.searchField.value),
				query = searchService + q;
			if (
				typeof e.which == 'number' && (
				e.which == 8 || // Detect backspaces
				e.which > 44 // but not tab, enter, ctrl, etc...
				)
			) {
				self.searchOnKeyUp(self.searchService, q, query);
			} else {
				self.acListKeystrokeSelect(e.which);
			}
		};
		// Handle autocomplete close btn click
		self.autocompleteCloseBtn.onclick = function() {
			self.clearAutocompleteResults();
			self.toggleAutocompleteList(false);
		};
	};
}

window.onload = function() {
	var ucfhbAcCloseBtn				= document.getElementById('ucfhb-search-autocomplete-close'),
		ucfhbAcSrHelp				= document.getElementById('ucfhb-search-autocomplete-srhelp'),
		ucfhbAcList					= document.getElementById('ucfhb-search-autocomplete'),
		ucfhbSearchForm				= document.getElementById('ucfhb-search-form'),
		ucfhbSearchField			= document.getElementById('ucfhb-search-field'),
		ucfhbSearchService			= ucfhbSearchForm.getAttribute('data-autosearch-url'),
		ucfhbSearchAction			= ucfhbSearchForm.getAttribute('data-action-url');

	var ucfhbAutocomplete = new autocomplete(ucfhbAcCloseBtn, ucfhbAcSrHelp, ucfhbAcList, ucfhbSearchForm, ucfhbSearchField, ucfhbSearchService, ucfhbSearchAction);
	ucfhbAutocomplete.initialize();
};