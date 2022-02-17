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

      var handleSearchSubmit = function(e) {
        e.preventDefault();
        var searchURL = searchForm.getAttribute('data-action-url') + encodeURIComponent(searchField.value);
        ucfhbTrackAction(searchURL, ucfhbTrackingActionSearch, searchField.value);
      };

      if (searchForm.addEventListener) {
        searchForm.addEventListener('submit', handleSearchSubmit, false);
      } else if (searchForm.attachEvent) {
        searchForm.attachEvent('onsubmit', handleSearchSubmit);
      }
    };
    ucfhbEventListener();
  }

  contentLoaded(window, function() {
    ucfhbCreateBar(ucfhbInitialize);
  });
})();
