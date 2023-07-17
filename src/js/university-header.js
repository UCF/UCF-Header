function gtag(){window.dataLayer.push(arguments)}window.dataLayer=window.dataLayer||[],function(){var f,h,m,g,p,UCFHB_VERSION="@!@VERSION@!@",UCFHB_GA_ACCOUNT="@!@GA@!@";function e(){var e=document.getElementsByTagName("head")[0],t=document.createElement("link"),e=(t.setAttribute("href",f),t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),e.appendChild(t),!0===p&&((t=document.createElement("link")).setAttribute("href",h),t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),e.appendChild(t)),!0===g&&((t=document.createElement("link")).setAttribute("href",m),t.setAttribute("rel","stylesheet"),t.setAttribute("type","text/css"),e.appendChild(t)),null);function a(e,t){for(var a=e.length,n=0;n<a;n++)e[n].className=t}document.getElementById("ucfhb")?e=document.getElementById("ucfhb"):((e=document.createElement("div")).id="ucfhb",document.body.insertBefore(e,document.body.firstChild)),e.className+=" preload",e.setAttribute("role","complementary"),e.setAttribute("aria-label","University of Central Florida navbar"),e.innerHTML='\n<div id="ucfhb-inner" style="display: none;">\n  <div id="ucfhb-left">\n    <div id="ucfhb-logo">\n      <a href="https://www.ucf.edu" aria-label="University of Central Florida"></a>\n    </div>\n    <button id="ucfhb-mobile-toggle" aria-controls="ucfhb-right" aria-expanded="false" aria-label="Toggle Mobile Menu"></button>\n  </div>\n  <div id="ucfhb-right">\n    <div id="ucfhb-signon">\n      <button id="ucfhb-signon-logo" aria-controls="ucfhb-services" aria-expanded="false" aria-label="UCF Sign In"></button>\n      <div id="ucfhb-services">\n        <div>\n          <a id="ucfhb-workday" class="ucfhb-service" href="https://workday.ucf.edu/" aria-label="Workday"></a>\n          <a id="ucfhb-myucf" class="ucfhb-service" href="https://my.ucf.edu/psp/IHPROD/EMPLOYEE/EMPL/?cmd=login" aria-label="myUCF"></a>\n          <a id="ucfhb-knightsmail" class="ucfhb-service" href="https://webmail.ucf.edu" aria-label="WebMail"></a>\n          <a id="ucfhb-webcourses" class="ucfhb-service" href="https://webcourses.ucf.edu" aria-label="Webcourses"></a>\n        </div>\n      </div>\n    </div>\n    <div id="ucfhb-search">\n      <form action="//search.ucf.edu/" data-action-url="//search.ucf.edu#?q=" method="get" name="ucfhb-search-form" id="ucfhb-search-form">\n        <label for="ucfhb-search-field" id="ucfhb-search-field-label">Search UCF</label>\n        <input type="text" name="#q" id="ucfhb-search-field" placeholder="Search UCF" />\n        <button type="submit" value="Search" id="ucfhb-search-submit" aria-label="Submit"></button>\n      </form>\n      <button id="ucfhb-search-minimal" aria-controls="ucfhb-search" aria-expanded="true" aria-label="Search"></button>\n    </div>\n  </div>\n</div>\n    '.trim(),UCFHB_GA_ACCOUNT&&(gtag("js",new Date),gtag("config",UCFHB_GA_ACCOUNT),(t=document.createElement("script")).type="text/javascript",t.async=!0,t.src="https://www.googletagmanager.com/gtag/js?id="+UCFHB_GA_ACCOUNT,(e=document.getElementsByTagName("script")[0]).parentNode.insertBefore(t,e));var t=document.getElementById("ucfhb"),n=document.getElementById("ucfhb-mobile-toggle"),e=document.getElementById("ucfhb-logo"),o=document.getElementById("ucfhb-right"),i=document.getElementById("ucfhb-signon-logo"),l=document.getElementById("ucfhb-search"),r=document.getElementById("ucfhb-search-form"),c=document.getElementById("ucfhb-search-field"),d=document.getElementById("ucfhb-search-submit"),u=document.getElementById("ucfhb-search-minimal"),s=[i,l,u],b=[t,n,e,o];r.addEventListener("submit",function(e){e.preventDefault();e=r.getAttribute("data-action-url")+encodeURIComponent(c.value);document.location=e},!1),i.onclick=function(){"ucfhb-shiftleft"===i.className?(a(s,""),c.removeAttribute("tabindex"),d.removeAttribute("tabindex"),i.setAttribute("aria-expanded","false"),u.setAttribute("aria-expanded","true")):(a(s,"ucfhb-shiftleft"),c.setAttribute("tabindex","-1"),d.setAttribute("tabindex","-1"),i.setAttribute("aria-expanded","true"),u.setAttribute("aria-expanded","false"))},u.onclick=function(){a(s,""),c.focus(),c.removeAttribute("tabindex"),d.removeAttribute("tabindex"),i.setAttribute("aria-expanded","false"),u.setAttribute("aria-expanded","true")},n.onclick=function(){"ucfhb-mobileslide"===n.className?(a(b,""),n.setAttribute("aria-expanded","false")):(a(b,"ucfhb-mobileslide"),n.setAttribute("aria-expanded","true"))}}"@!@"!=="@!@ROOT_URL@!@".substring(0,3)&&(UCFHB_VERSION&&"@!@"!==UCFHB_VERSION.substring(0,3)||(UCFHB_VERSION=Date.now().toString(10)),UCFHB_GA_ACCOUNT&&"@!@"!==UCFHB_GA_ACCOUNT.substring(0,3)||(UCFHB_GA_ACCOUNT=null),f=window.location.protocol+"//@!@ROOT_URL@!@/bar/css/bar.css?"+UCFHB_VERSION,h=window.location.protocol+"//@!@ROOT_URL@!@/bar/css/bar-bootstrap.css?"+UCFHB_VERSION,m=window.location.protocol+"//@!@ROOT_URL@!@/bar/css/1200-breakpoint.css?"+UCFHB_VERSION,UCFHB_VERSION=null,p=g=!1,document.getElementById("ucfhb-script")&&(-1<(UCFHB_VERSION=document.getElementById("ucfhb-script")).getAttribute("src").indexOf("use-bootstrap-overrides=1")&&(p=!0),-1<UCFHB_VERSION.getAttribute("src").indexOf("use-1200-breakpoint=1")&&(g=!0)),"loading"===document.readyState?document.addEventListener("DOMContentLoaded",e):e())}();