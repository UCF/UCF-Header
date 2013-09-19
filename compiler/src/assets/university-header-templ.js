/**
 * Append analytics code
 **/
var _gaq = _gaq || [];
_gaq.push(['ucfhb._setAccount', '@!@GA@!@']);
_gaq.push(['ucfhb._setDomainName', 'none']);
_gaq.push(['ucfhb._trackPageview']);
(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/**
 * Click tracking
 **/
var ucfhbTrackClick = function(link, action, label) {
	_gaq.push(['ucfhb._trackEvent', 'Header', action, label]);
	window.setTimeout(function(){ document.location = link; }, 200);
};
var ucfhbAssignTrackingListener = function(elem, eventType, link, action, label) {
	eventType 	= String(eventType);
	action 		= action || null;
	label 		= label || null;

	// Cross-browser addEventListener check.
	if (elem.addEventListener) {
		elem.addEventListener(eventType, function(event) {
			event.preventDefault();

			// One off for form submit since we 
			// need to get the value on the fly
			if (eventType == 'submit') {
				label = label.value || null;
				if (label !== null) {
					link += encodeURIComponent(label);
				}
			}

			// Only track actions w/valid values
			if (action !== null && label !== null) {
				ucfhbTrackClick(link, action, label);
			}
			else {
				document.location = link;
			}
		}, false);
	}
	else {
		elem.attachEvent('on' + eventType, function(event) {
			// One off for form submit since we 
			// need to get the value on the fly
			if (eventType == 'submit') {
				label = label.value || null;
				if (label !== null) {
					link += encodeURIComponent(label);
				}
			}

			// Only track actions w/valid values
			if (action !== null && label !== null) {
				ucfhbTrackClick(link, action, label);
			}
			else {
				document.location = link;
			}
			return false;
		});
	}
};


/**
 * JSONP implementation for search service proxy results
 **/
var ucfhbJsonp = null; 
function ucfhbSetJsonp(json) {
	if (json) {
		ucfhbJsonp = json;
	}
	else {
		ucfhbJsonp = null;
	}
}


(function() {
	/**
	 * Locations of external CSS files.
	 * These resources should be protocol-agnostic and link to
	 * an absolute URL.
	 **/
	var ucfhbStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/university-header.css',
		ucfhbBsStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/university-header-bootstrap.css',
		ucfhbJsonpScript = window.location.protocol + '//@!@ROOT_URL@!@/bar/data/?search=';


	/**
	 * Check if data-bootstrap-override has been passed to the
	 * university header script. Requires that the script tag
	 * has an ID of 'ucfhb-script'
	 **/
	var useBsOverride = false;
	var ucfhbScript = null;
	if (document.getElementById('ucfhb-script')) {
		ucfhbScript = document.getElementById('ucfhb-script');
		if (ucfhbScript.getAttribute('src').indexOf('use-bootstrap-overrides=1') > -1) {
			useBsOverride = true;
		}
	}


	/**
	 * contentloaded.js
	 *
	 * Author: Diego Perini (diego.perini at gmail.com)
	 * Summary: cross-browser wrapper for DOMContentLoaded
	 * Updated: 20101020
	 * License: MIT
	 * Version: 1.2
	 *
	 * URL:
	 * http://javascript.nwbox.com/ContentLoaded/
	 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
	 *
	 **/

	// @win window reference
	// @fn function reference
	function contentLoaded(win, fn) {

		var done = false, top = true,

		doc = win.document, root = doc.documentElement,

		add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
		rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
		pre = doc.addEventListener ? '' : 'on',

		init = function(e) {
			if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
			(e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
			if (!done && (done = true)) fn.call(win, e.type || e);
		},

		poll = function() {
			try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
			init('poll');
		};

		if (doc.readyState == 'complete') fn.call(win, 'lazy');
		else {
			if (doc.createEventObject && root.doScroll) {
				try { top = !win.frameElement; } catch(e) { }
				if (top) poll();
			}
			doc[add](pre + 'DOMContentLoaded', init, false);
			doc[add](pre + 'readystatechange', init, false);
			win[add](pre + 'load', init, false);
		}

	}


	/**
	 * Make <IE9 behave (indexOf array searching, trim, JSON parsing functionality).
	 *
	 * Uses Douglas Crockford's json2.js parser, MDN's Array.indexOf fix, and .trim fix here:
	 * http://stackoverflow.com/a/2308157
	 **/
	// Array.indexOf
	if(!Array.prototype.indexOf){Array.prototype.indexOf=function(e){"use strict";if(this==null){throw new TypeError}var t,n,r=Object(this),i=r.length>>>0;if(i===0){return-1}t=0;if(arguments.length>1){t=Number(arguments[1]);if(t!=t){t=0}else if(t!=0&&t!=Infinity&&t!=-Infinity){t=(t>0||-1)*Math.floor(Math.abs(t))}}if(t>=i){return-1}for(n=t>=0?t:Math.max(i-Math.abs(t),0);n<i;n++){if(n in r&&r[n]===e){return n}}return-1}}
	// json2.js
	if(typeof JSON!=="object"){JSON={}}(function(){"use strict";function f(e){return e<10?"0"+e:e}function quote(e){escapable.lastIndex=0;return escapable.test(e)?'"'+e.replace(escapable,function(e){var t=meta[e];return typeof t==="string"?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var n,r,i,s,o=gap,u,a=t[e];if(a&&typeof a==="object"&&typeof a.toJSON==="function"){a=a.toJSON(e)}if(typeof rep==="function"){a=rep.call(t,e,a)}switch(typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a){return"null"}gap+=indent;u=[];if(Object.prototype.toString.apply(a)==="[object Array]"){s=a.length;for(n=0;n<s;n+=1){u[n]=str(n,a)||"null"}i=u.length===0?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+o+"]":"["+u.join(",")+"]";gap=o;return i}if(rep&&typeof rep==="object"){s=rep.length;for(n=0;n<s;n+=1){if(typeof rep[n]==="string"){r=rep[n];i=str(r,a);if(i){u.push(quote(r)+(gap?": ":":")+i)}}}}else{for(r in a){if(Object.prototype.hasOwnProperty.call(a,r)){i=str(r,a);if(i){u.push(quote(r)+(gap?": ":":")+i)}}}}i=u.length===0?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+o+"}":"{"+u.join(",")+"}";gap=o;return i}}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","	":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(e,t,n){var r;gap="";indent="";if(typeof n==="number"){for(r=0;r<n;r+=1){indent+=" "}}else if(typeof n==="string"){indent=n}rep=t;if(t&&typeof t!=="function"&&(typeof t!=="object"||typeof t.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":e})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(e,t){var n,r,i=e[t];if(i&&typeof i==="object"){for(n in i){if(Object.prototype.hasOwnProperty.call(i,n)){r=walk(i,n);if(r!==undefined){i[n]=r}else{delete i[n]}}}}return reviver.call(e,t,i)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})()
	// .trim
	if(typeof String.prototype.trim!=="function"){String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")}}


	/**
	 * Generate a script tag for autocomplete search results (JSONP)
	 **/
	var ucfhbCreateJsonpScript = function(query, callback, timeout) {
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.setAttribute('src', ucfhbJsonpScript + query);
		script.setAttribute('type', 'text/javascript');
		script.id = 'ucfhb-json';
		head.appendChild(script);

		if (typeof callback !== 'undefined' && callback !== null) {
			setTimeout(function() { callback(); }, timeout);
		}
	}


	/** 
	 * Insert the bar into the DOM; start listening for events.
	 * Uses contentLoaded.js to determine when the DOM is ready.
	 **/
	var ucfhbCreateBar = function(callback) {
		/* Append stylesheet to head */
		var head = document.getElementsByTagName('head')[0];
		var stylesheet = document.createElement('link');
		stylesheet.setAttribute('href', ucfhbStylesheet);
		stylesheet.setAttribute('rel', 'stylesheet');
		stylesheet.setAttribute('type', 'text/css');
		head.appendChild(stylesheet);

		/* Append Bootstrap 2.x override stylesheet to head */
		if (useBsOverride === true) {
			var bsStylesheet = document.createElement('link');
			bsStylesheet.setAttribute('href', ucfhbBsStylesheet);
			bsStylesheet.setAttribute('rel', 'stylesheet');
			bsStylesheet.setAttribute('type', 'text/css');
			head.appendChild(bsStylesheet);
		}

		/* Create the outermost bar div, if necessary */
		var ucfhbBar = null;
		if (document.getElementById('ucfhb')) {
			ucfhbBar = document.getElementById('ucfhb');
		}
		else {
			ucfhbBar = document.createElement('div');
			ucfhbBar.id = 'ucfhb';
			document.body.insertBefore(ucfhbBar, document.body.firstChild);
		}

		// Add the bar's markup; initialize autocomplete + event listeners
		var markup = @!@MARKUP@!@;
		ucfhbBar.innerHTML = markup.join('\n');

		ucfhbCreateJsonpScript('', null, 0);

		callback();
	}

	var ucfhbInitialize = function() {
		var ucfhbAutocomplete = new ucfhbAutocompleteSearch();
		ucfhbAutocomplete.initialize();

		/* Define listeners */
		var ucfhbEventListener = function() {
			// Fetch inserted DOM elements
			var ucfhbBar = document.getElementById('ucfhb'),
				mobileToggle = document.getElementById('ucfhb-mobile-toggle'),
				ucfLogo = document.getElementById('ucfhb-logo'),
				barRight = document.getElementById('ucfhb-right'),
				myUCFBtn = document.getElementById('ucfhb-signon-logo'),
				myUCFWrapper = document.getElementById('ucfhb-signon'),
				searchbar = document.getElementById('ucfhb-search'),
				searchForm = document.getElementById('ucfhb-search-form');
				searchField = document.getElementById('ucfhb-search-field'),
				searchBtn = document.getElementById('ucfhb-search-submit'),
				searchMinimal = document.getElementById('ucfhb-search-minimal'),
				searchAutocomplete = document.getElementById('ucfhb-search-autocomplete'),
				linkMyucf = document.getElementById('ucfhb-myucf'),
				linkKnightsmail = document.getElementById('ucfhb-knightsmail'),
				linkWebcourses = document.getElementById('ucfhb-webcourses'),

				shiftLeftElems = [myUCFBtn, searchbar, searchMinimal, searchAutocomplete],
				mobileToggleElems = [ucfhbBar, mobileToggle, ucfLogo, barRight, searchAutocomplete];

			var goldBarClass = 'ucfhb-gold';

			// Function to toggle classes on an array of elements
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
			// MyUCF Sliding functionality
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
			// Mobile show/hide functionality
			mobileToggle.onclick = function() {
				if (mobileToggle.className == 'ucfhb-mobileslide') {
					toggleClasses(mobileToggleElems, '');
				}
				else {
					toggleClasses(mobileToggleElems, 'ucfhb-mobileslide');
				}
			};

			// Analytics tracking (this functionality is also added to
			// all links in autocomplete list items)
			ucfhbAssignTrackingListener(searchForm, 'submit', searchForm.getAttribute('data-action-url'), 'search', searchField);
			ucfhbAssignTrackingListener(linkMyucf, 'click', linkMyucf.getAttribute('href'), 'signon', 'MyUCF');
			ucfhbAssignTrackingListener(linkKnightsmail, 'click', linkKnightsmail.getAttribute('href'), 'signon', 'Knightsmail');
			ucfhbAssignTrackingListener(linkWebcourses, 'click', linkWebcourses.getAttribute('href'), 'signon', 'Webcourses');
		};
		ucfhbEventListener();
	}

	contentLoaded(window, function() {
		ucfhbCreateBar(ucfhbInitialize);
	});


	/**
	 * University Header Auto-Suggest Search Result functionality 
	 **/
	function ucfhbAutocompleteSearch() {
		var self = this;

		this.searchService			= ucfhbJsonpScript;	// URL of the search service queried for autocomplete results (URL to UCF search service proxy)

		this.autocompleteCloseBtn	= document.getElementById('ucfhb-search-autocomplete-close');	// <a> element in corner of autocomplete results
		this.autocompleteHelp		= document.getElementById('ucfhb-search-autocomplete-srhelp');	// Help text for screenreaders
		this.autocompleteList		= document.getElementById('ucfhb-search-autocomplete');			// Autocomplete <ul> element
		this.autocompleteSelectedId = 'ucfhb-autocomplete-selected';								// ID assigned to a selected autocomplete <li>
		this.searchForm				= document.getElementById('ucfhb-search-form');					// Search <form> element
		this.searchField			= document.getElementById('ucfhb-search-field');				// Search <input> element
		this.searchAction			= this.searchForm.getAttribute('data-action-url');				// 'data-action-url' attr of search <form> element; should match form 'action' attr. (URL to Google Search Appliance)
		this.searchActiveClass		= 'search-is-active';											// Class assigned to an active (visible) autocomplete <ul>

		// this.keyterms contains all autocomplete keyterms + matches that are attempted before attempting a search service request.
		this.keyterms = @!@KEYTERMS@!@;

		var timer;	// setTimeout timer value used by self.searchOnKeyUp


		// Iterate through objects within an object (private)
		// http://stackoverflow.com/a/3529588
		function countObjectProperties(obj) {
			var count = 0;
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					count++;
				}
			}
			return count;
		}

		// Strip HTML tags from a string.
		function stripTags(str) {
			return str.replace(/(<([^>]+)>)/ig, '');
		}

		// Detect whether a click event occurred within the boundaries
		// of a given element.
		// http://stackoverflow.com/a/1278068
		function outsideElementClick(objEvent, objElement) {
			var objCurrentElement = objEvent.target || objEvent.srcElement;
			var blnInsideX = false;
			var blnInsideY = false;

			if (
				objCurrentElement.getBoundingClientRect().left >= objElement.getBoundingClientRect().left &&
				objCurrentElement.getBoundingClientRect().right <= objElement.getBoundingClientRect().right
			) {
				blnInsideX = true;
			}

			if (
				objCurrentElement.getBoundingClientRect().top >= objElement.getBoundingClientRect().top &&
				objCurrentElement.getBoundingClientRect().bottom <= objElement.getBoundingClientRect().bottom
			) {
				blnInsideY = true;
			}

			if (blnInsideX && blnInsideY) {
				return false;
			}
			else {
				return true;
			}
		}

		// Retrieve JSONP results from search service proxy
		function ucfhbGetJsonp(query, callback) {
			var script = document.getElementById('ucfhb-json');
			if (script) {
				script.parentNode.removeChild(script);
			}
			ucfhbCreateJsonpScript(query, function() {
				var json = JSON.parse(ucfhbJsonp);
				callback(json);
			}, 600); // Give Javascript time to rebuild the script tag value
		}


		// Delete existing results in an autocomplete list
		this.clearAutocompleteResults = function() {
			while (self.autocompleteList.hasChildNodes()) {
				self.autocompleteList.removeChild(self.autocompleteList.lastChild);
			}
		};

		// Returns true or false if an autocomplete list is visible
		this.isSearchActive = function() {
			return self.autocompleteList.className == self.searchActiveClass;
		};

		// Show/hide the autocomplete list and adjust ARIA landmarks as necessary
		this.toggleAutocompleteList = function(toggleVal) {
			// Always make sure any previous results are cleared
			self.clearAutocompleteResults();
			if (toggleVal === true) {
				self.autocompleteList.className = self.searchActiveClass;
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
		
		// Output a search query's results:
		this.outputResults = function(q, url) {
			var safeq = stripTags(q),				// Query with tags stripped
				matchq = safeq.toLowerCase();		// Query made lowercase for matching against JSON vals
				urlq = encodeURIComponent(safeq);	// URL-safe Query

			// Function for adding 'View more' link to the end of
			// an autocomplete list
			var appendViewMore = function() {
				var viewMoreLi = document.createElement('li');
				var viewMoreLink = self.searchAction + urlq;
				viewMoreLi.innerHTML = '<a href="' + viewMoreLink + '" tabindex="0">View More Results</a>';
				viewMoreLi.className = 'ucfhb-search-autocomplete-more';
				viewMoreLi.setAttribute('data-name-val', safeq);

				var link = viewMoreLi.getElementsByTagName('a')[0];
				ucfhbAssignTrackingListener(link, 'click', new String(viewMoreLink), "search", "View more results: " + safeq);

				self.autocompleteList.appendChild(viewMoreLi);
			};
			
			// Make sure there is actually a query to search for
			if (safeq !== '') {

				// Search against keyterm list first.
				if (self.keyterms.terms) {
					i = 0;
					var terms = self.keyterms.terms,
						matches = self.keyterms.matches,
						matchesFound = 0;
						results = [];

					for (i = 0; i < countObjectProperties(terms); i++) {
						var termKey = "t_" + (i + 1),
							matchKey = "m_" + (i + 1);

						if (terms[termKey].indexOf(matchq) > -1) {
							matchesFound++;
							results.push(matches[matchKey]);
						}
					}
					if (matchesFound > 0) {
						self.toggleAutocompleteList(true);

						i = 0;
						for (i = 0; i < matchesFound; i++) {
							var name = stripTags(results[i].name.trim()),
								nameSpan = '<span class="ucfhb-search-autocomplete-name">' + name + '</span>',
								resultUrl = results[i].url !== '' ? stripTags(results[i].url.trim()) : self.searchAction + urlq;

							var listItem = document.createElement('li');
							listItem.innerHTML = '<a href="' + resultUrl + '" tabindex="0">' + nameSpan + '</a>';
							listItem.setAttribute('data-name-val', name);

							self.autocompleteList.appendChild(listItem);

							var link = listItem.getElementsByTagName('a')[0];
							ucfhbAssignTrackingListener(link, 'click', new String(resultUrl), "search", "" + name);
						}

						// Add 'View More Results link'; update screenreader help text
						appendViewMore();
						self.updateAutocompleteHelp(matchesFound, safeq);
					}
					// Try search service results if no keyterms are found
					else {
						ucfhbGetJsonp(urlq, function(json) {
							if (json && json.results !== null && json.results.length > 0) {
								self.toggleAutocompleteList(true);
								i = 0;
								for (i = 0; i < json.results.length; i++) {
									matchesFound++;

									var name = json.results[i].name !== null ? stripTags(json.results[i].name.trim()) : '',
										nameSpan = '<span class="ucfhb-search-autocomplete-name">' + name + '</span>',
										orgSpan = json.results[i].organization !== null ? '<span class="ucfhb-search-autocomplete-org">' + stripTags(json.results[i].organization.trim()) + '</span>' : '',
										resultUrl = self.searchAction + encodeURIComponent(name);
										
									var listItem = document.createElement('li');
									listItem.innerHTML = '<a href="' + resultUrl + '" tabindex="0" >' + nameSpan + orgSpan + '</a>';
									listItem.setAttribute('data-name-val', name);
									
									var link = listItem.getElementsByTagName('a')[0];
									ucfhbAssignTrackingListener(link, 'click', new String(resultUrl), "search", "" + name);
									
									self.autocompleteList.appendChild(listItem);
								}
								// Add 'View More Results link'; update screenreader help text
								appendViewMore();
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
				selectedId = self.autocompleteSelectedId,
				selectedLi = null,
				listNextSibling = null,
				listPrevSibling = null;

			if (document.getElementById(selectedId)) {
				selectedLi = document.getElementById(selectedId);
			}
			else {
				selectedLi = listFirstChild;
			}

			// Function to 'select' a list item in an autocomplete list
			var selectNewResult = function(oldLi, newLi, defaultLi) {
				var newSearchVal = '';

				// Unset any previously set ID
				oldLi.id = '';
				listFirstChild.id = '';
				listLastChild.id = '';

				// previous/nextSibling returns null when sibling is not found
				if (newLi !== null) {
					defaultLi.id = '';
					newLi.id = selectedId;
					newSearchVal = newLi.getAttribute('data-name-val');
				}
				else {
					defaultLi.id = selectedId;
					newSearchVal = defaultLi.getAttribute('data-name-val');
				}

				// Assign new search field value
				self.searchField.value = newSearchVal;

				// Simulate a right-arrow keystroke to force a re-read of 
				// search field val for screenreaders.
				// Fall back to document.createEventObject for <IE9
				// http://stackoverflow.com/a/12187302
				// http://stackoverflow.com/a/827793
				var srEvent = null;
				if (document.createEvent) {
					srEvent = document.createEvent('KeyboardEvent');
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
				}
				else if (document.createEventObject) {
					srEvent = document.createEventObject('KeyboardEvent');
					srEvent.keyCode = 39;
					self.searchField.fireEvent('onkeyup', srEvent);
				}
			};

			// Detect an up/down keypress
			// (when search field is focused + autocomplete is visible)
			if (self.isSearchActive() && document.activeElement == self.searchField) {
				if (keycode == 40) {
					// Move down one list item. Check if a list item is highlighted yet or not
					if (document.getElementById(selectedId)) {
						listNextSibling = selectedLi.nextSibling;
					}
					else {
						listNextSibling = listFirstChild;
					}
					selectNewResult(selectedLi, listNextSibling, listFirstChild);
				}
				else if (keycode == 38) {
					// Move up one list item
					listPrevSibling = selectedLi.previousSibling;
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
		this.searchOnKeyUp = function(q, query) {
			clearTimeout(timer);
			timer = setTimeout(function () {
				self.outputResults(q, query);
			}, 550);
		};
		
		// On load + listen for events
		this.initialize = function() {
			var q = null,
				query = null;

			// Handle the onkeyup event for autosearching:
			self.searchField.onkeyup = function(e) {
				// Make <IE9 behave
				e = e || window.event;
				keycode = e.which || e.keyCode;

				q = stripTags(self.searchField.value);
				query = self.searchService + q;

				// If this keystroke is a backspace or other alphabetic character,
				// or if this is specifically an arrow-down keystroke when
				// the search field is already populated:
				if (
					(
						typeof keycode == 'number' && (
						keycode == 8 || // Detect backspaces
						keycode > 44 // And alphanumeric characters
						)
					) ||
					(
						self.isSearchActive() === false &&
						self.searchField.value !== null &&
						self.searchField.value !== '' &&
						keycode === 40
					)
				) {
					self.searchOnKeyUp(q, query);
				}
				// Otherwise, check for up/down arrow keystrokes on an
				// active search:
				else {
					self.acListKeystrokeSelect(keycode);
				}
			};

			// Handle a re-focus of the search field when search is not active
			self.searchField.onfocus = function() {
				q = stripTags(self.searchField.value);
				query = self.searchService + q;
				
				if (
					self.isSearchActive() === false &&
					self.searchField.value !== '' &&
					self.searchField.value !== null
				) {
					self.searchOnKeyUp(q, query);
				}
			};

			// Handle autocomplete close w/btn click or click outside list
			// Checks for standard addEventListener, falls back to attachEvent
			self.autocompleteCloseBtn.onclick = function() {
				self.toggleAutocompleteList(false);
			};
			if (document.addEventListener) {
				document.addEventListener('click', function(e) {
					if (outsideElementClick(e, self.autocompleteList) && self.isSearchActive()) {
						self.toggleAutocompleteList(false);
					}
				});
			}
			else {
				document.attachEvent('onclick', function(e) {
					if (outsideElementClick(e, self.autocompleteList) && self.isSearchActive()) {
						self.toggleAutocompleteList(false);
					}
				});
			}
		};
	}
})();