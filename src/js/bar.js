window.dataLayer = window.dataLayer || [];
function gtag() {
  window.dataLayer.push(arguments);
}

(function () {

  //
  // Define constants
  //

  let UCFHB_VERSION    = '@!@VERSION@!@';
  let UCFHB_GA_ACCOUNT = '@!@GA@!@';
  const UCFHB_ROOT_URL = '@!@ROOT_URL@!@';

  if (!UCFHB_ROOT_URL || UCFHB_ROOT_URL.substring(0, 3) === '@!@') {
    // Back out early if this is missing
    return;
  }

  if (!UCFHB_VERSION || UCFHB_VERSION.substring(0, 3) === '@!@') {
    UCFHB_VERSION = Date.now().toString(10);
  }
  if (!UCFHB_GA_ACCOUNT || UCFHB_GA_ACCOUNT.substring(0, 3) === '@!@') {
    UCFHB_GA_ACCOUNT = null;
  }

  // Define GA tracking actions
  const ucfhbTrackingActionLogoClick = 'ucf-logo'; // When a UCF Login button is clicked
  const ucfhbTrackingActionSearch    = 'search'; // When the search form is submitted
  const ucfhbTrackingActionSignon    = 'signon'; // When the UCF logo is clicked

  // Locations of external CSS files.
  // These resources should be protocol-agnostic and link to
  // an absolute URL.
  const ucfhbStylesheet       = `${window.location.protocol}//${UCFHB_ROOT_URL}/bar/css/bar.css?${UCFHB_VERSION}`;
  const ucfhbBsStylesheet     = `${window.location.protocol}//${UCFHB_ROOT_URL}/bar/css/bar-bootstrap.css?${UCFHB_VERSION}`;
  const ucfhb1200BpStylesheet = `${window.location.protocol}//${UCFHB_ROOT_URL}/bar/css/1200-breakpoint.css?${UCFHB_VERSION}`;

  // Check if data-bootstrap-override has been passed to the
  // university header script. Requires that the script tag
  // has an ID of 'ucfhb-script'
  let ucfhbScript       = null;
  let use1200Breakpoint = false;
  let useBsOverride     = false;

  if (document.getElementById('ucfhb-script')) {
    ucfhbScript = document.getElementById('ucfhb-script');
    if (ucfhbScript.getAttribute('src').indexOf('use-bootstrap-overrides=1') > -1) {
      useBsOverride = true;
    }

    if (ucfhbScript.getAttribute('src').indexOf('use-1200-breakpoint=1') > -1) {
      use1200Breakpoint = true;
    }
  }


  //
  // Click tracking
  //

  function ucfhbTrackAction(link, action, label) {
    // Only track actions w/valid values
    if (UCFHB_GA_ACCOUNT && action !== null && label !== null) {
      gtag(['ucfhb._trackEvent', 'Header', action, label]);
      window.setTimeout(() => {
        document.location = link;
      }, 200);
    } else {
      document.location = link;
    }
  }

  function ucfhbAssignTrackingListener(elem, eventType, link, action, label) {
    eventType = String(eventType);
    action = action || null;
    label = label || null;

    elem.addEventListener(eventType, (event) => {
      event.preventDefault();
      ucfhbTrackAction(link, action, label);
    }, false);
  }


  //
  // Insert the bar and its stylesheets into the DOM.
  //

  function ucfhbCreateBar() {
    // Append stylesheet to head
    const head = document.getElementsByTagName('head')[0];
    const stylesheet = document.createElement('link');
    stylesheet.setAttribute('href', ucfhbStylesheet);
    stylesheet.setAttribute('rel', 'stylesheet');
    stylesheet.setAttribute('type', 'text/css');
    head.appendChild(stylesheet);

    // Append Bootstrap 2.x override stylesheet to head
    if (useBsOverride === true) {
      const bsStylesheet = document.createElement('link');
      bsStylesheet.setAttribute('href', ucfhbBsStylesheet);
      bsStylesheet.setAttribute('rel', 'stylesheet');
      bsStylesheet.setAttribute('type', 'text/css');
      head.appendChild(bsStylesheet);
    }

    // Append 1200 breakpoint stylesheet to head
    if (use1200Breakpoint === true) {
      const bp1200Stylesheet = document.createElement('link');
      bp1200Stylesheet.setAttribute('href', ucfhb1200BpStylesheet);
      bp1200Stylesheet.setAttribute('rel', 'stylesheet');
      bp1200Stylesheet.setAttribute('type', 'text/css');
      head.appendChild(bp1200Stylesheet);
    }

    // Create the outermost bar div, if necessary
    let ucfhbBar = null;
    if (document.getElementById('ucfhb')) {
      ucfhbBar = document.getElementById('ucfhb');
    } else {
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

    // Add the bar's markup
    ucfhbBar.innerHTML = `
<div id="ucfhb-inner" style="display: none;">
  <div id="ucfhb-left">
    <div id="ucfhb-logo">
      <a href="https://www.ucf.edu" aria-label="University of Central Florida"></a>
    </div>
    <button id="ucfhb-mobile-toggle" aria-controls="ucfhb-right" aria-expanded="false" aria-label="Toggle Mobile Menu"></button>
  </div>
  <div id="ucfhb-right">
    <div id="ucfhb-signon">
      <button id="ucfhb-signon-logo" aria-controls="ucfhb-services" aria-expanded="false" aria-label="UCF Sign In"></button>
      <div id="ucfhb-services">
        <div>
          <a id="ucfhb-workday" class="ucfhb-service" href="https://workday.ucf.edu/" aria-label="Workday"></a>
          <a id="ucfhb-myucf" class="ucfhb-service" href="https://my.ucf.edu/psp/IHPROD/EMPLOYEE/EMPL/?cmd=login" aria-label="myUCF"></a>
          <a id="ucfhb-knightsmail" class="ucfhb-service" href="http://knightsemail.ucf.edu" aria-label="KnightsMail"></a>
          <a id="ucfhb-webcourses" class="ucfhb-service" href="https://webcourses.ucf.edu" aria-label="Webcourses"></a>
        </div>
      </div>
    </div>
    <div id="ucfhb-search">
      <form action="//search.ucf.edu/" data-action-url="//search.ucf.edu#?q=" method="get" name="ucfhb-search-form" id="ucfhb-search-form">
        <label for="ucfhb-search-field" id="ucfhb-search-field-label">Search UCF</label>
        <input type="text" name="#q" id="ucfhb-search-field" placeholder="Search UCF" />
        <button type="submit" value="Search" id="ucfhb-search-submit" aria-label="Submit"></button>
      </form>
      <button id="ucfhb-search-minimal" aria-controls="ucfhb-search" aria-expanded="true" aria-label="Search"></button>
    </div>
  </div>
</div>
    `.trim();

    // Append analytics code
    if (UCFHB_GA_ACCOUNT) {
      gtag('js', new Date());
      gtag('config', UCFHB_GA_ACCOUNT);
      (function () {
        const ga = document.createElement('script');
        ga.type = 'text/javascript';
        ga.async = true;
        ga.src = `https://www.googletagmanager.com/gtag/js?id=${UCFHB_GA_ACCOUNT}`;
        const s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(ga, s);
      }());
    }

    // Initialize event listeners
    ucfhbInitialize();
  }


  //
  // Initialize events and other behavior for the
  // bar after it's been inserted into the DOM
  //

  function ucfhbInitialize() {
    // Fetch inserted DOM elements
    const ucfhbBar        = document.getElementById('ucfhb');
    const mobileToggle    = document.getElementById('ucfhb-mobile-toggle');
    const ucfLogo         = document.getElementById('ucfhb-logo');
    const ucfLogoLink     = ucfLogo.firstElementChild || ucfLogo.firstChild;
    const barRight        = document.getElementById('ucfhb-right');
    const myUCFBtn        = document.getElementById('ucfhb-signon-logo');
    const searchbar       = document.getElementById('ucfhb-search');
    const searchForm      = document.getElementById('ucfhb-search-form');
    const searchField     = document.getElementById('ucfhb-search-field');
    const searchBtn       = document.getElementById('ucfhb-search-submit');
    const searchMinimal   = document.getElementById('ucfhb-search-minimal');
    const linkMyucf       = document.getElementById('ucfhb-myucf');
    const linkKnightsmail = document.getElementById('ucfhb-knightsmail');
    const linkWebcourses  = document.getElementById('ucfhb-webcourses');

    const shiftLeftElems    = [myUCFBtn, searchbar, searchMinimal];
    const mobileToggleElems = [ucfhbBar, mobileToggle, ucfLogo, barRight];

    // Function to toggle classes on an array of elements
    const toggleClasses = function (elems, newClassName) {
      const length = elems.length;
      for (let i = 0; i < length; i++) {
        elems[i].className = newClassName;
      }
    };

    // MyUCF Sliding functionality
    myUCFBtn.onclick = function () {
      if (myUCFBtn.className === 'ucfhb-shiftleft') {
        toggleClasses(shiftLeftElems, '');
        // Re-enable tabbing for previously disabled elements
        searchField.removeAttribute('tabindex');
        searchBtn.removeAttribute('tabindex');
        // Adjust aria-expanded attributes on sign-in and search togglers
        myUCFBtn.setAttribute('aria-expanded', 'false');
        searchMinimal.setAttribute('aria-expanded', 'true');
      } else {
        toggleClasses(shiftLeftElems, 'ucfhb-shiftleft');
        // Disable tabbing on hidden elements
        searchField.setAttribute('tabindex', '-1');
        searchBtn.setAttribute('tabindex', '-1');
        // Adjust aria-expanded attributes on sign-in and search togglers
        myUCFBtn.setAttribute('aria-expanded', 'true');
        searchMinimal.setAttribute('aria-expanded', 'false');
      }
    };

    searchMinimal.onclick = function () {
      toggleClasses(shiftLeftElems, '');
      searchField.focus();
      searchField.removeAttribute('tabindex');
      searchBtn.removeAttribute('tabindex');
      // Adjust aria-expanded attributes on sign-in and search togglers
      myUCFBtn.setAttribute('aria-expanded', 'false');
      searchMinimal.setAttribute('aria-expanded', 'true');
    };

    // Mobile show/hide functionality
    mobileToggle.onclick = function () {
      if (mobileToggle.className === 'ucfhb-mobileslide') {
        toggleClasses(mobileToggleElems, '');
        // Adjust aria-expanded attribute on mobile toggler
        mobileToggle.setAttribute('aria-expanded', 'false');
      } else {
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

    const handleSearchSubmit = function (e) {
      e.preventDefault();
      const searchURL = searchForm.getAttribute('data-action-url') + encodeURIComponent(searchField.value);
      ucfhbTrackAction(searchURL, ucfhbTrackingActionSearch, searchField.value);
    };

    searchForm.addEventListener('submit', handleSearchSubmit, false);
  }


  //
  // Register the bar to populate in once DOMContentLoaded
  // is dispatched:
  //

  if (document.readyState === 'loading') {
    // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', ucfhbCreateBar);
  } else {
    // `DOMContentLoaded` has already fired
    ucfhbCreateBar();
  }

}());
