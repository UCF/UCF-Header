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
var ucfhbTrackAction = function(link, action, label) {
  // Only track actions w/valid values
  if (action !== null && label !== null) {
    _gaq.push(['ucfhb._trackEvent', 'Header', action, label]);
    window.setTimeout(function(){ document.location = link; }, 200);
  }
  else {
    document.location = link;
  }
};
var ucfhbAssignTrackingListener = function(elem, eventType, link, action, label) {
  eventType   = String(eventType);
  action    = action || null;
  label     = label || null;

  // Cross-browser addEventListener check.
  if (elem.addEventListener) {
    elem.addEventListener(eventType, function(event) {
      event.preventDefault();
      ucfhbTrackAction(link, action, label);
    }, false);
  }
  else {
    elem.attachEvent('on' + eventType, function(event) {
      ucfhbTrackAction(link, action, label);
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
   * Define GA tracking actions
   **/
  var ucfhbTrackingActionSignon = 'signon',               // When a UCF Login button is clicked
    ucfhbTrackingActionSearch = 'search',               // When the search form is submitted (no autocomplete results were selected)
    ucfhbTrackingActionACKeyterm = 'autocomplete-keyterm-search',   // When an autocomplete keyterm suggestion is clicked or submitted
    ucfhbTrackingActionACSearch = 'autocomplete-search',      // When a non-keyterm autocomplete suggestion is clicked or submitted
    ucfhbTrackingActionLogoClick = 'ucf-logo';            // When the UCF logo is clicked

  /**
   * Locations of external CSS files.
   * These resources should be protocol-agnostic and link to
   * an absolute URL.
   **/
  var ucfhbStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/bar.css?@!@VERSION@!@',
    ucfhbBsStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/bar-bootstrap.css?@!@VERSION@!@',
    ucfhb1200BpStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/1200-breakpoint.css?@!@VERSION@!@',
    ucfhbJsonpScript = window.location.protocol + '//@!@ROOT_URL@!@/bar/data/?search=';


  /**
   * Check if data-bootstrap-override has been passed to the
   * university header script. Requires that the script tag
   * has an ID of 'ucfhb-script'
   **/
  var useBsOverride = false,
    use1200Breakpoint = false,
    ucfhbScript = null;
  if (document.getElementById('ucfhb-script')) {
    ucfhbScript = document.getElementById('ucfhb-script');
    if (ucfhbScript.getAttribute('src').indexOf('use-bootstrap-overrides=1') > -1) {
      useBsOverride = true;
    }

    if (ucfhbScript.getAttribute('src').indexOf('use-1200-breakpoint=1') > -1) {
      use1200Breakpoint = true;
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
   * Make <IE9 behave (trim, JSON parsing functionality).
   *
   * Uses Douglas Crockford's json2.js parser and .trim fix here:
   * http://stackoverflow.com/a/2308157
   **/
  // json2.js
  if(typeof JSON!=="object"){JSON={}}(function(){"use strict";function f(e){return e<10?"0"+e:e}function quote(e){escapable.lastIndex=0;return escapable.test(e)?'"'+e.replace(escapable,function(e){var t=meta[e];return typeof t==="string"?t:"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+e+'"'}function str(e,t){var n,r,i,s,o=gap,u,a=t[e];if(a&&typeof a==="object"&&typeof a.toJSON==="function"){a=a.toJSON(e)}if(typeof rep==="function"){a=rep.call(t,e,a)}switch(typeof a){case"string":return quote(a);case"number":return isFinite(a)?String(a):"null";case"boolean":case"null":return String(a);case"object":if(!a){return"null"}gap+=indent;u=[];if(Object.prototype.toString.apply(a)==="[object Array]"){s=a.length;for(n=0;n<s;n+=1){u[n]=str(n,a)||"null"}i=u.length===0?"[]":gap?"[\n"+gap+u.join(",\n"+gap)+"\n"+o+"]":"["+u.join(",")+"]";gap=o;return i}if(rep&&typeof rep==="object"){s=rep.length;for(n=0;n<s;n+=1){if(typeof rep[n]==="string"){r=rep[n];i=str(r,a);if(i){u.push(quote(r)+(gap?": ":":")+i)}}}}else{for(r in a){if(Object.prototype.hasOwnProperty.call(a,r)){i=str(r,a);if(i){u.push(quote(r)+(gap?": ":":")+i)}}}}i=u.length===0?"{}":gap?"{\n"+gap+u.join(",\n"+gap)+"\n"+o+"}":"{"+u.join(",")+"}";gap=o;return i}}if(typeof Date.prototype.toJSON!=="function"){Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null};String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()}}var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b"," ":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;if(typeof JSON.stringify!=="function"){JSON.stringify=function(e,t,n){var r;gap="";indent="";if(typeof n==="number"){for(r=0;r<n;r+=1){indent+=" "}}else if(typeof n==="string"){indent=n}rep=t;if(t&&typeof t!=="function"&&(typeof t!=="object"||typeof t.length!=="number")){throw new Error("JSON.stringify")}return str("",{"":e})}}if(typeof JSON.parse!=="function"){JSON.parse=function(text,reviver){function walk(e,t){var n,r,i=e[t];if(i&&typeof i==="object"){for(n in i){if(Object.prototype.hasOwnProperty.call(i,n)){r=walk(i,n);if(r!==undefined){i[n]=r}else{delete i[n]}}}}return reviver.call(e,t,i)}var j;text=String(text);cx.lastIndex=0;if(cx.test(text)){text=text.replace(cx,function(e){return"\\u"+("0000"+e.charCodeAt(0).toString(16)).slice(-4)})}if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,""))){j=eval("("+text+")");return typeof reviver==="function"?walk({"":j},""):j}throw new SyntaxError("JSON.parse")}}})()
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

    /* Append 1200 breakpoint stylesheet to head */
    if (use1200Breakpoint === true) {
      var bp1200Stylesheet = document.createElement('link');
      bp1200Stylesheet.setAttribute('href', ucfhb1200BpStylesheet);
      bp1200Stylesheet.setAttribute('rel', 'stylesheet');
      bp1200Stylesheet.setAttribute('type', 'text/css');
      head.appendChild(bp1200Stylesheet);
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

    // Add .preload class to #ucfhb to prevent onload transition
    // animations. This class is removed when the mobile toggle btn
    // is clicked (and this class is replaced/removed.)
    ucfhbBar.className += ' preload';

    // Add role="complementary" with label to #ucfhb.
    ucfhbBar.setAttribute('role', 'complementary');
    ucfhbBar.setAttribute('aria-label', 'University of Central Florida navbar');

    // Add the bar's markup; initialize autocomplete + event listeners
    var markup = @!@MARKUP@!@;
    ucfhbBar.innerHTML = markup.join('\n');

    // Add screenreader helper element to the bottom of the document.
    var ucfhbAutocompleteHelp = document.createElement('span');
    ucfhbAutocompleteHelp.id = 'ucfhb-search-autocomplete-srhelp';
    ucfhbAutocompleteHelp.setAttribute('role', 'status');
    ucfhbAutocompleteHelp.setAttribute('aria-live', 'polite');
    document.body.appendChild(ucfhbAutocompleteHelp);

    callback();
  }

  var ucfhbInitialize = function() {
    var ucfhbAutocomplete = new ucfhbAutocompleteSearch();
    ucfhbAutocomplete.initialize();

    /* Define listeners */
    var ucfhbEventListener = function() {
      // Fetch inserted DOM elements
      var ucfhbBar      = document.getElementById('ucfhb'),
        mobileToggle    = document.getElementById('ucfhb-mobile-toggle'),
        ucfLogo       = document.getElementById('ucfhb-logo'),
        ucfLogoLink     = ucfLogo.firstElementChild || ucfLogo.firstChild,
        barRight      = document.getElementById('ucfhb-right'),
        myUCFBtn      = document.getElementById('ucfhb-signon-logo'),
        myUCFWrapper    = document.getElementById('ucfhb-signon'),
        searchbar       = document.getElementById('ucfhb-search'),
        searchForm      = document.getElementById('ucfhb-search-form');
        searchField     = document.getElementById('ucfhb-search-field'),
        searchBtn       = document.getElementById('ucfhb-search-submit'),
        searchMinimal     = document.getElementById('ucfhb-search-minimal'),
        searchAutocomplete  = document.getElementById('ucfhb-search-autocomplete'),
        linkMyucf       = document.getElementById('ucfhb-myucf'),
        linkKnightsmail   = document.getElementById('ucfhb-knightsmail'),
        linkWebcourses    = document.getElementById('ucfhb-webcourses'),

        shiftLeftElems    = [myUCFBtn, searchbar, searchMinimal, searchAutocomplete],
        mobileToggleElems   = [ucfhbBar, mobileToggle, ucfLogo, barRight, searchAutocomplete];

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
          // Adjust aria-expanded attributes on sign-in and search togglers
          myUCFBtn.setAttribute('aria-expanded', 'false');
          searchMinimal.setAttribute('aria-expanded', 'true');
        }
        else {
          toggleClasses(shiftLeftElems, 'ucfhb-shiftleft');
          // Disable tabbing on hidden elements
          searchField.setAttribute('tabindex', '-1');
          searchBtn.setAttribute('tabindex', '-1');
          // Adjust aria-expanded attributes on sign-in and search togglers
          myUCFBtn.setAttribute('aria-expanded', 'true');
          searchMinimal.setAttribute('aria-expanded', 'false');
        }
      };
      searchMinimal.onclick = function() {
        toggleClasses(shiftLeftElems, '');
        searchField.focus();
        searchField.removeAttribute('tabindex');
        searchBtn.removeAttribute('tabindex');
        // Adjust aria-expanded attributes on sign-in and search togglers
        myUCFBtn.setAttribute('aria-expanded', 'false');
        searchMinimal.setAttribute('aria-expanded', 'true');
      };
      // Mobile show/hide functionality
      mobileToggle.onclick = function() {
        if (mobileToggle.className == 'ucfhb-mobileslide') {
          toggleClasses(mobileToggleElems, '');
          // Adjust aria-expanded attribute on mobile toggler
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
        else {
          toggleClasses(mobileToggleElems, 'ucfhb-mobileslide');
          // Adjust aria-expanded attribute on mobile toggler
          mobileToggle.setAttribute('aria-expanded', 'true');
        }
      };

      // Analytics tracking (this functionality is also added to
      // all links in autocomplete list items and for form submissions)
      ucfhbAssignTrackingListener(linkMyucf, 'click', linkMyucf.getAttribute('href'), ucfhbTrackingActionSignon, 'MyUCF');
      ucfhbAssignTrackingListener(linkKnightsmail, 'click', linkKnightsmail.getAttribute('href'), ucfhbTrackingActionSignon, 'Knightsmail');
      ucfhbAssignTrackingListener(linkWebcourses, 'click', linkWebcourses.getAttribute('href'), ucfhbTrackingActionSignon, 'Webcourses');
      ucfhbAssignTrackingListener(ucfLogoLink, 'click', ucfLogoLink.getAttribute('href'), ucfhbTrackingActionLogoClick, 'UCF Logo');
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

    this.searchService      = ucfhbJsonpScript; // URL of the search service queried for autocomplete results (URL to UCF search service proxy)

    this.autocompleteHelp   = document.getElementById('ucfhb-search-autocomplete-srhelp');  // Help text for screenreaders
    this.autocompleteList   = document.getElementById('ucfhb-search-autocomplete');     // Autocomplete <ul> element
    this.autocompleteSelectedId = 'ucfhb-autocomplete-selected';                // ID assigned to a selected autocomplete <li>
    this.searchForm       = document.getElementById('ucfhb-search-form');         // Search <form> element
    this.searchCombobox   = document.getElementById('ucfhb-search-combobox'),     // Wrapper combobox element around the search <input>
    this.searchField      = document.getElementById('ucfhb-search-field');        // Search <input> element
    this.searchSubmit     = document.getElementById('ucfhb-search-submit');       // Search submit button element
    this.searchAction     = this.searchForm.getAttribute('data-action-url');        // 'data-action-url' attr of search <form> element; should match form 'action' attr. (URL to UCF Search frontend)
    this.searchActiveClass    = 'search-is-active';                     // Class assigned to an active (visible) autocomplete <ul>
    this.searchKeytermLinkClass = 'search-autocomplete-keyterm';                // Class assigned to an autocomplete <a> element that links to a keyterm's URL
    this.searchResultsLinkClass = 'search-autocomplete-result';                 // Class assigned to an autocomplete <a> elements that links to a non-keyterm's URL (generic search result)

    // this.keyterms contains all autocomplete keyterms + matches that are attempted before attempting a search service request.
    this.keyterms = @!@KEYTERMS@!@;

    var timer;  // setTimeout timer value used by self.searchOnKeyUp


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
      // Wipe out any existing activedescendant value on the search input
      self.searchField.removeAttribute('aria-activedescendant');
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
        self.searchCombobox.setAttribute('aria-expanded', 'true');
      }
      else {
        self.autocompleteList.className = '';
        self.searchCombobox.setAttribute('aria-expanded', 'false');
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
      var safeq = stripTags(q),       // Query with tags stripped
        matchq = safeq.toLowerCase(),   // Query made lowercase for matching against JSON vals
        urlq = encodeURIComponent(safeq); // URL-safe Query

      // Make sure there is actually a query to search for
      if (safeq.length > 1) {

        // Search against keyterm list first.
        if (self.keyterms.keyterms) {
          var matchesFound = 0;
              results = [];

          for (var i = 0; i < self.keyterms.keyterms.length; i++) {
            var keyterm = self.keyterms.keyterms[i];

            // Search each value in keyterm.matches for a match until one is found
            for (var j = 0; j < keyterm.matches.length; j++) {
              var match = keyterm.matches[j];
              if (match.indexOf(matchq) > -1) {
                matchesFound++;
                results.push(keyterm);
                break;
              }
            }

            // Don't allow more than 5 autocomplete results to be returned
            if (matchesFound > 4) {
              break;
            }
          }

          if (matchesFound > 0) {
            self.toggleAutocompleteList(true);

            for (var k = 0; k < matchesFound; k++) {
              var name = stripTags(results[k].name.trim()),
                nameSpan = '<span class="ucfhb-search-autocomplete-name">' + name + '</span>',
                resultUrl = results[k].url !== '' ? stripTags(results[k].url.trim()) : self.searchAction + urlq;

              var listItem = document.createElement('li');
              listItem.innerHTML = '<a class="' + self.searchKeytermLinkClass + '" href="' + resultUrl + '" tabindex="0">' + nameSpan + '</a>';
              listItem.setAttribute('data-name-val', name);

              self.autocompleteList.appendChild(listItem);

              var link = listItem.getElementsByTagName('a')[0];
              ucfhbAssignTrackingListener(link, 'click', new String(resultUrl), ucfhbTrackingActionACKeyterm, '' + name);
            }

            // Add 'View More Results link'; update screenreader help text
            self.updateAutocompleteHelp(matchesFound, safeq);
          }
          // Try search service results if no keyterms are found
          else {
            ucfhbGetJsonp(urlq, function(json) {
              if (json && json.results !== null && json.results.length > 0) {
                self.toggleAutocompleteList(true);

                for (var l = 0; l < json.results.length; l++) {
                  matchesFound++;

                  var name = json.results[l].name !== null ? stripTags(json.results[l].name.trim()) : '',
                    nameSpan = '<span class="ucfhb-search-autocomplete-name">' + name + '</span>',
                    orgSpan = json.results[l].organization !== null ? '<span class="ucfhb-search-autocomplete-org">' + stripTags(json.results[l].organization.trim()) + '</span>' : '',
                    resultUrl = self.searchAction + encodeURIComponent(name);

                  var listItem = document.createElement('li');
                  listItem.innerHTML = '<a class="'+ self.searchResultsLinkClass +'" href="' + resultUrl + '" tabindex="0" >' + nameSpan + orgSpan + '</a>';
                  listItem.setAttribute('data-name-val', name);
                  listItem.setAttribute('role', 'option');

                  var link = listItem.getElementsByTagName('a')[0];
                  ucfhbAssignTrackingListener(link, 'click', new String(resultUrl), ucfhbTrackingActionACSearch, '' + name);

                  self.autocompleteList.appendChild(listItem);
                }
                // Add 'View More Results link'; update screenreader help text
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

        // Unset any existing aria-selected attribute
        oldLi.removeAttribute('aria-selected');
        listFirstChild.removeAttribute('aria-selected');
        listLastChild.removeAttribute('aria-selected');

        // previous/nextSibling returns null when sibling is not found
        if (newLi !== null) {
          defaultLi.id = '';
          newLi.id = selectedId;
          newLi.setAttribute('aria-selected', 'true');
          this.searchField.setAttribute('aria-activedescendant', selectedId);
          newSearchVal = newLi.getAttribute('data-name-val');
        }
        else {
          defaultLi.id = selectedId;
          defaultLi.setAttribute('aria-selected', 'true');
          this.searchField.setAttribute('aria-activedescendant', selectedId);
          newSearchVal = defaultLi.getAttribute('data-name-val');
        }

        // Assign new search field value
        self.searchField.value = newSearchVal.replace(/&#39;/g, "'");
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
        else if (keycode == 39 || keycode == 37 || keycode == 13) {
          // Left or right arrow keypress or enter key; do nothing
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
        // Add support for Escape key:
        else if (
          typeof keycode == 'number' &&
          keycode == 27
        ) {
          self.toggleAutocompleteList(false); // Close the autosuggestion listbox
          setTimeout((function () {
            // On Firefox, input does not get cleared here unless wrapped in
            // a setTimeout
            self.searchField.value = ''; // Clear search input
          }).bind(self), 1);
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

      // Handle search form submission; intercept and redirect to a
      // provided URL instead of search results if necessary.
      // Checks for standard addEventListener, falls back to attachEvent
      var handleAutocompleteSelect = function(event) {
        if (event.preventDefault) {
          event.preventDefault();
        }
        else {
          event.returnValue = false;
        }

        var selectedLi = document.getElementById(self.autocompleteSelectedId);

        // If an autocomplete list item is highlighted and is 'submitted'
        // with the enter key, redirect the user to the URL provided
        // in the list item instead of to search results
        if (
          selectedLi &&
          self.isSearchActive() === true
        ) {
          var selectedLink = selectedLi.getElementsByTagName('a')[0];

          // Distinguish between keyterm searches and other generic searches
          if (selectedLink) {
            if (selectedLink.className.indexOf(self.searchKeytermLinkClass) > -1) {
              ucfhbTrackAction(selectedLink.getAttribute('href'), ucfhbTrackingActionACKeyterm, self.searchField.value);
            }
            else if (selectedLink.className.indexOf(self.searchResultsLinkClass) > -1) {
              ucfhbTrackAction(selectedLink.getAttribute('href'), ucfhbTrackingActionACSearch, self.searchField.value);
            }
          }
        }
        else {
          var searchURL = self.searchForm.getAttribute('data-action-url') + encodeURIComponent(self.searchField.value);
          ucfhbTrackAction(searchURL, ucfhbTrackingActionSearch, self.searchField.value);
        }
      }
      if (self.searchForm.addEventListener) {
          self.searchForm.addEventListener('submit', handleAutocompleteSelect, false);
      }
      else if (self.searchForm.attachEvent) {
          self.searchForm.attachEvent('onsubmit', handleAutocompleteSelect);
      }

      // Handle autocomplete close w/btn click or click outside list.
      // Make sure to avoid tracking form submissions as outer element clicks;
      // search form submission is detected as a 'click' here on the form submit btn.
      // Checks for standard addEventListener, falls back to attachEvent.
      if (document.addEventListener) {
        document.addEventListener('click', function(e) {
          var target = e.target || e.srcElement;
          if ( target && e.target.getAttribute('id') !== self.searchSubmit.getAttribute('id') ) {
            if (outsideElementClick(e, self.autocompleteList) && self.isSearchActive()) {
              self.toggleAutocompleteList(false);
            }
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
