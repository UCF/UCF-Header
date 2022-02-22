(function () {
  //
  // Define constants
  //
  var _gaq = _gaq || [];

  var UCFHB_VERSION = '@!@VERSION@!@';
  var UCFHB_GA_ACCOUNT = '@!@GA@!@';
  var UCFHB_ROOT_URL = '@!@ROOT_URL@!@';

  if (!UCFHB_ROOT_URL || UCFHB_ROOT_URL.startsWith('@!@')) {
    // Back out early if this is missing
    return;
  }

  if (!UCFHB_VERSION || UCFHB_VERSION.startsWith('@!@')) {
    UCFHB_VERSION = Date.now().toString(10);
  }

  if (!UCFHB_GA_ACCOUNT || UCFHB_GA_ACCOUNT.startsWith('@!@')) {
    UCFHB_GA_ACCOUNT = null;
  } //
  // Append analytics code
  //


  if (UCFHB_GA_ACCOUNT) {
    _gaq.push(['ucfhb._setAccount', UCFHB_GA_ACCOUNT]);

    _gaq.push(['ucfhb._setDomainName', 'none']);

    _gaq.push(['ucfhb._trackPageview']);

    (function () {
      var ga = document.createElement('script');
      ga.type = 'text/javascript';
      ga.async = true;
      ga.src = (document.location.protocol === 'https:' ? 'https://ssl' : 'http://www') + ".google-analytics.com/ga.js";
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(ga, s);
    })();
  } //
  // Click tracking
  //


  var ucfhbTrackAction = function ucfhbTrackAction(link, action, label) {
    // Only track actions w/valid values
    if (UCFHB_GA_ACCOUNT && action !== null && label !== null) {
      _gaq.push(['ucfhb._trackEvent', 'Header', action, label]);

      window.setTimeout(function () {
        document.location = link;
      }, 200);
    } else {
      document.location = link;
    }
  };

  var ucfhbAssignTrackingListener = function ucfhbAssignTrackingListener(elem, eventType, link, action, label) {
    eventType = String(eventType);
    action = action || null;
    label = label || null;
    elem.addEventListener(eventType, function (event) {
      event.preventDefault();
      ucfhbTrackAction(link, action, label);
    }, false);
  }; //
  // Define GA tracking actions
  //


  var ucfhbTrackingActionLogoClick = 'ucf-logo'; // When a UCF Login button is clicked

  var ucfhbTrackingActionSearch = 'search'; // When the search form is submitted

  var ucfhbTrackingActionSignon = 'signon'; // When the UCF logo is clicked
  //
  // Locations of external CSS files.
  // These resources should be protocol-agnostic and link to
  // an absolute URL.
  //

  var ucfhbStylesheet = window.location.protocol + "//" + UCFHB_ROOT_URL + "/bar/css/bar.css?" + UCFHB_VERSION;
  var ucfhbBsStylesheet = window.location.protocol + "//" + UCFHB_ROOT_URL + "/bar/css/bar-bootstrap.css?" + UCFHB_VERSION;
  var ucfhb1200BpStylesheet = window.location.protocol + "//" + UCFHB_ROOT_URL + "/bar/css/1200-breakpoint.css?" + UCFHB_VERSION; //
  // Check if data-bootstrap-override has been passed to the
  // university header script. Requires that the script tag
  // has an ID of 'ucfhb-script'
  //

  var ucfhbScript = null;
  var use1200Breakpoint = false;
  var useBsOverride = false;

  if (document.getElementById('ucfhb-script')) {
    ucfhbScript = document.getElementById('ucfhb-script');

    if (ucfhbScript.getAttribute('src').indexOf('use-bootstrap-overrides=1') > -1) {
      useBsOverride = true;
    }

    if (ucfhbScript.getAttribute('src').indexOf('use-1200-breakpoint=1') > -1) {
      use1200Breakpoint = true;
    }
  } //
  // Insert the bar and its stylesheets into the DOM;
  // start listening for events.
  //


  var ucfhbCreateBar = function ucfhbCreateBar() {
    // Append stylesheet to head
    var head = document.getElementsByTagName('head')[0];
    var stylesheet = document.createElement('link');
    stylesheet.setAttribute('href', ucfhbStylesheet);
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('type', 'text/css');
    head.appendChild(stylesheet); // Append Bootstrap 2.x override stylesheet to head

    if (useBsOverride === true) {
      var bsStylesheet = document.createElement('link');
      bsStylesheet.setAttribute('href', ucfhbBsStylesheet);
      bsStylesheet.setAttribute('rel', 'stylesheet');
      bsStylesheet.setAttribute('type', 'text/css');
      head.appendChild(bsStylesheet);
    } // Append 1200 breakpoint stylesheet to head


    if (use1200Breakpoint === true) {
      var bp1200Stylesheet = document.createElement('link');
      bp1200Stylesheet.setAttribute('href', ucfhb1200BpStylesheet);
      bp1200Stylesheet.setAttribute('rel', 'stylesheet');
      bp1200Stylesheet.setAttribute('type', 'text/css');
      head.appendChild(bp1200Stylesheet);
    } // Create the outermost bar div, if necessary


    var ucfhbBar = null;

    if (document.getElementById('ucfhb')) {
      ucfhbBar = document.getElementById('ucfhb');
    } else {
      ucfhbBar = document.createElement('div');
      ucfhbBar.id = 'ucfhb';
      document.body.insertBefore(ucfhbBar, document.body.firstChild);
    } // Add .preload class to #ucfhb to prevent onload transition
    // animations. This class is removed when the mobile toggle btn
    // is clicked (and this class is replaced/removed.)


    ucfhbBar.className += ' preload'; // Add role="complementary" with label to #ucfhb.

    ucfhbBar.setAttribute('role', 'complementary');
    ucfhbBar.setAttribute('aria-label', 'University of Central Florida navbar'); // Add the bar's markup; initialize event listeners

    ucfhbBar.innerHTML = "\n<div id=\"ucfhb-inner\" style=\"display: none;\">\n  <div id=\"ucfhb-left\">\n    <div id=\"ucfhb-logo\">\n      <a href=\"https://www.ucf.edu\" aria-label=\"University of Central Florida\"></a>\n    </div>\n    <button id=\"ucfhb-mobile-toggle\" aria-controls=\"ucfhb-right\" aria-expanded=\"false\" aria-label=\"Toggle Mobile Menu\"></button>\n  </div>\n  <div id=\"ucfhb-right\">\n    <div id=\"ucfhb-signon\">\n      <button id=\"ucfhb-signon-logo\" aria-controls=\"ucfhb-services\" aria-expanded=\"false\" aria-label=\"UCF Sign In\"></button>\n      <div id=\"ucfhb-services\">\n        <div>\n          <a id=\"ucfhb-myucf\" class=\"ucfhb-service\" href=\"https://my.ucf.edu/psp/IHPROD/EMPLOYEE/EMPL/?cmd=login\" aria-label=\"myUCF\"></a>\n          <a id=\"ucfhb-knightsmail\" class=\"ucfhb-service\" href=\"http://knightsemail.ucf.edu\" aria-label=\"KnightsMail\"></a>\n          <a id=\"ucfhb-webcourses\" class=\"ucfhb-service\" href=\"https://webcourses.ucf.edu\" aria-label=\"Webcourses\"></a>\n        </div>\n      </div>\n    </div>\n    <div id=\"ucfhb-search\">\n      <form action=\"//search.ucf.edu/\" data-action-url=\"//search.ucf.edu#?q=\" method=\"get\" name=\"ucfhb-search-form\" id=\"ucfhb-search-form\">\n        <label for=\"ucfhb-search-field\" id=\"ucfhb-search-field-label\">Search UCF</label>\n        <input type=\"text\" name=\"#q\" id=\"ucfhb-search-field\" placeholder=\"Search UCF\" />\n        <button type=\"submit\" value=\"Search\" id=\"ucfhb-search-submit\" aria-label=\"Submit\"></button>\n      </form>\n      <button id=\"ucfhb-search-minimal\" aria-controls=\"ucfhb-search\" aria-expanded=\"true\" aria-label=\"Search\"></button>\n    </div>\n  </div>\n</div>\n    ".trim();
    ucfhbInitialize();
  };

  var ucfhbInitialize = function ucfhbInitialize() {
    // Fetch inserted DOM elements
    var ucfhbBar = document.getElementById('ucfhb');
    var mobileToggle = document.getElementById('ucfhb-mobile-toggle');
    var ucfLogo = document.getElementById('ucfhb-logo');
    var ucfLogoLink = ucfLogo.firstElementChild || ucfLogo.firstChild;
    var barRight = document.getElementById('ucfhb-right');
    var myUCFBtn = document.getElementById('ucfhb-signon-logo');
    var searchbar = document.getElementById('ucfhb-search');
    var searchForm = document.getElementById('ucfhb-search-form');
    var searchField = document.getElementById('ucfhb-search-field');
    var searchBtn = document.getElementById('ucfhb-search-submit');
    var searchMinimal = document.getElementById('ucfhb-search-minimal');
    var linkMyucf = document.getElementById('ucfhb-myucf');
    var linkKnightsmail = document.getElementById('ucfhb-knightsmail');
    var linkWebcourses = document.getElementById('ucfhb-webcourses');
    var shiftLeftElems = [myUCFBtn, searchbar, searchMinimal];
    var mobileToggleElems = [ucfhbBar, mobileToggle, ucfLogo, barRight]; // Function to toggle classes on an array of elements

    var toggleClasses = function toggleClasses(elems, newClassName) {
      var length = elems.length;

      for (var i = 0; i < length; i++) {
        elems[i].className = newClassName;
      }
    }; // MyUCF Sliding functionality


    myUCFBtn.onclick = function () {
      if (myUCFBtn.className === 'ucfhb-shiftleft') {
        toggleClasses(shiftLeftElems, ''); // Re-enable tabbing for previously disabled elements

        searchField.removeAttribute('tabindex');
        searchBtn.removeAttribute('tabindex'); // Adjust aria-expanded attributes on sign-in and search togglers

        myUCFBtn.setAttribute('aria-expanded', 'false');
        searchMinimal.setAttribute('aria-expanded', 'true');
      } else {
        toggleClasses(shiftLeftElems, 'ucfhb-shiftleft'); // Disable tabbing on hidden elements

        searchField.setAttribute('tabindex', '-1');
        searchBtn.setAttribute('tabindex', '-1'); // Adjust aria-expanded attributes on sign-in and search togglers

        myUCFBtn.setAttribute('aria-expanded', 'true');
        searchMinimal.setAttribute('aria-expanded', 'false');
      }
    };

    searchMinimal.onclick = function () {
      toggleClasses(shiftLeftElems, '');
      searchField.focus();
      searchField.removeAttribute('tabindex');
      searchBtn.removeAttribute('tabindex'); // Adjust aria-expanded attributes on sign-in and search togglers

      myUCFBtn.setAttribute('aria-expanded', 'false');
      searchMinimal.setAttribute('aria-expanded', 'true');
    }; // Mobile show/hide functionality


    mobileToggle.onclick = function () {
      if (mobileToggle.className === 'ucfhb-mobileslide') {
        toggleClasses(mobileToggleElems, ''); // Adjust aria-expanded attribute on mobile toggler

        mobileToggle.setAttribute('aria-expanded', 'false');
      } else {
        toggleClasses(mobileToggleElems, 'ucfhb-mobileslide'); // Adjust aria-expanded attribute on mobile toggler

        mobileToggle.setAttribute('aria-expanded', 'true');
      }
    }; // Analytics tracking


    ucfhbAssignTrackingListener(linkMyucf, 'click', linkMyucf.getAttribute('href'), ucfhbTrackingActionSignon, 'MyUCF');
    ucfhbAssignTrackingListener(linkKnightsmail, 'click', linkKnightsmail.getAttribute('href'), ucfhbTrackingActionSignon, 'Knightsmail');
    ucfhbAssignTrackingListener(linkWebcourses, 'click', linkWebcourses.getAttribute('href'), ucfhbTrackingActionSignon, 'Webcourses');
    ucfhbAssignTrackingListener(ucfLogoLink, 'click', ucfLogoLink.getAttribute('href'), ucfhbTrackingActionLogoClick, 'UCF Logo');

    var handleSearchSubmit = function handleSearchSubmit(e) {
      e.preventDefault();
      var searchURL = searchForm.getAttribute('data-action-url') + encodeURIComponent(searchField.value);
      ucfhbTrackAction(searchURL, ucfhbTrackingActionSearch, searchField.value);
    };

    searchForm.addEventListener('submit', handleSearchSubmit, false);
  };

  if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', ucfhbCreateBar);
  } else {
    // `DOMContentLoaded` has already fired
    ucfhbCreateBar();
  }
})();