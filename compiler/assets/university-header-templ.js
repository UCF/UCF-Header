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


(function() {
  /**
   * Define GA tracking actions
   **/
  var ucfhbTrackingActionSignon = 'signon',               // When a UCF Login button is clicked
    ucfhbTrackingActionSearch = 'search',               // When the search form is submitted
    ucfhbTrackingActionLogoClick = 'ucf-logo';            // When the UCF logo is clicked

  /**
   * Locations of external CSS files.
   * These resources should be protocol-agnostic and link to
   * an absolute URL.
   **/
  var ucfhbStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/bar.css?@!@VERSION@!@',
    ucfhbBsStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/bar-bootstrap.css?@!@VERSION@!@',
    ucfhb1200BpStylesheet = window.location.protocol + '//@!@ROOT_URL@!@/bar/css/1200-breakpoint.css?@!@VERSION@!@';


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

    // Add the bar's markup; initialize event listeners
    var markup = @!@MARKUP@!@;
    ucfhbBar.innerHTML = markup.join('\n');

    callback();
  }

  var ucfhbInitialize = function() {
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
        linkMyucf       = document.getElementById('ucfhb-myucf'),
        linkKnightsmail   = document.getElementById('ucfhb-knightsmail'),
        linkWebcourses    = document.getElementById('ucfhb-webcourses'),

        shiftLeftElems    = [myUCFBtn, searchbar, searchMinimal],
        mobileToggleElems   = [ucfhbBar, mobileToggle, ucfLogo, barRight];

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

      // Analytics tracking
      ucfhbAssignTrackingListener(linkMyucf, 'click', linkMyucf.getAttribute('href'), ucfhbTrackingActionSignon, 'MyUCF');
      ucfhbAssignTrackingListener(linkKnightsmail, 'click', linkKnightsmail.getAttribute('href'), ucfhbTrackingActionSignon, 'Knightsmail');
      ucfhbAssignTrackingListener(linkWebcourses, 'click', linkWebcourses.getAttribute('href'), ucfhbTrackingActionSignon, 'Webcourses');
      ucfhbAssignTrackingListener(ucfLogoLink, 'click', ucfLogoLink.getAttribute('href'), ucfhbTrackingActionLogoClick, 'UCF Logo');
      ucfhbAssignTrackingListener(searchForm, 'submit', searchForm.getAttribute('data-action-url') + encodeURIComponent(searchField.value), ucfhbTrackingActionSearch, 'Search');
    };
    ucfhbEventListener();
  }

  contentLoaded(window, function() {
    ucfhbCreateBar(ucfhbInitialize);
  });
})();
