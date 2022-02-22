!function(){var UCFHB_VERSION="@!@VERSION@!@",UCFHB_GA_ACCOUNT="@!@GA@!@";if(!"@!@ROOT_URL@!@".startsWith("@!@")){function d(e,t,n,i,a){t=String(t),i=i||null,a=a||null,e.addEventListener?e.addEventListener(t,function(e){e.preventDefault(),h(n,i,a)},!1):e.attachEvent("on"+t,function(e){return h(n,i,a),!1})}function l(){function e(e,t){for(var n=e.length,i=0;i<n;i++)-1<e[i].className.indexOf(u)?e[i].className=u+" "+t:e[i].className=t}function t(e){e.preventDefault(),e=s.getAttribute("data-action-url")+encodeURIComponent(searchField.value),h(e,"search",searchField.value)}var n=document.getElementById("ucfhb"),i=document.getElementById("ucfhb-mobile-toggle"),a=document.getElementById("ucfhb-logo"),c=a.firstElementChild||a.firstChild,r=document.getElementById("ucfhb-right"),l=document.getElementById("ucfhb-signon-logo"),o=(document.getElementById("ucfhb-signon"),document.getElementById("ucfhb-search")),s=document.getElementById("ucfhb-search-form"),u=(searchField=document.getElementById("ucfhb-search-field"),searchBtn=document.getElementById("ucfhb-search-submit"),searchMinimal=document.getElementById("ucfhb-search-minimal"),linkMyucf=document.getElementById("ucfhb-myucf"),linkKnightsmail=document.getElementById("ucfhb-knightsmail"),linkWebcourses=document.getElementById("ucfhb-webcourses"),shiftLeftElems=[l,o,searchMinimal],mobileToggleElems=[n,i,a,r],"ucfhb-gold");l.onclick=function(){"ucfhb-shiftleft"==l.className?(e(shiftLeftElems,""),searchField.removeAttribute("tabindex"),searchBtn.removeAttribute("tabindex"),l.setAttribute("aria-expanded","false"),searchMinimal.setAttribute("aria-expanded","true")):(e(shiftLeftElems,"ucfhb-shiftleft"),searchField.setAttribute("tabindex","-1"),searchBtn.setAttribute("tabindex","-1"),l.setAttribute("aria-expanded","true"),searchMinimal.setAttribute("aria-expanded","false"))},searchMinimal.onclick=function(){e(shiftLeftElems,""),searchField.focus(),searchField.removeAttribute("tabindex"),searchBtn.removeAttribute("tabindex"),l.setAttribute("aria-expanded","false"),searchMinimal.setAttribute("aria-expanded","true")},i.onclick=function(){"ucfhb-mobileslide"==i.className?(e(mobileToggleElems,""),i.setAttribute("aria-expanded","false")):(e(mobileToggleElems,"ucfhb-mobileslide"),i.setAttribute("aria-expanded","true"))},d(linkMyucf,"click",linkMyucf.getAttribute("href"),b,"MyUCF"),d(linkKnightsmail,"click",linkKnightsmail.getAttribute("href"),b,"Knightsmail"),d(linkWebcourses,"click",linkWebcourses.getAttribute("href"),b,"Webcourses"),d(c,"click",c.getAttribute("href"),"ucf-logo","UCF Logo"),s.addEventListener?s.addEventListener("submit",t,!1):s.attachEvent&&s.attachEvent("onsubmit",t)}UCFHB_VERSION&&!UCFHB_VERSION.startsWith("@!@")||(UCFHB_VERSION=Date.now().toString(10)),(UCFHB_GA_ACCOUNT=UCFHB_GA_ACCOUNT&&!UCFHB_GA_ACCOUNT.startsWith("@!@")?UCFHB_GA_ACCOUNT:null)&&((i=i||[]).push(["ucfhb._setAccount",UCFHB_GA_ACCOUNT]),i.push(["ucfhb._setDomainName","none"]),i.push(["ucfhb._trackPageview"]),(e=document.createElement("script")).type="text/javascript",e.async=!0,e.src=("https:"==document.location.protocol?"https://ssl":"http://www")+".google-analytics.com/ga.js",(a=document.getElementsByTagName("script")[0]).parentNode.insertBefore(e,a));var i,h=function(e,t,n){UCFHB_GA_ACCOUNT&&null!==t&&null!==n?(i.push(["ucfhb._trackEvent","Header",t,n]),window.setTimeout(function(){document.location=e},200)):document.location=e},b="signon",s=window.location.protocol+"//@!@ROOT_URL@!@/bar/css/bar.css?"+UCFHB_VERSION,u=window.location.protocol+"//@!@ROOT_URL@!@/bar/css/bar-bootstrap.css?"+UCFHB_VERSION,o=window.location.protocol+"//@!@ROOT_URL@!@/bar/css/1200-breakpoint.css?"+UCFHB_VERSION,e=null,f=!1,m=!1,t=(document.getElementById("ucfhb-script")&&(-1<(e=document.getElementById("ucfhb-script")).getAttribute("src").indexOf("use-bootstrap-overrides=1")&&(m=!0),-1<e.getAttribute("src").indexOf("use-1200-breakpoint=1")&&(f=!0)),window),g=function(){var e,t,n;e=l,t=document.getElementsByTagName("head")[0],(n=document.createElement("link")).setAttribute("href",s),n.setAttribute("rel","stylesheet"),n.setAttribute("type","text/css"),t.appendChild(n),!0===m&&((n=document.createElement("link")).setAttribute("href",u),n.setAttribute("rel","stylesheet"),n.setAttribute("type","text/css"),t.appendChild(n)),!0===f&&((n=document.createElement("link")).setAttribute("href",o),n.setAttribute("rel","stylesheet"),n.setAttribute("type","text/css"),t.appendChild(n)),t=null,document.getElementById("ucfhb")?t=document.getElementById("ucfhb"):((t=document.createElement("div")).id="ucfhb",document.body.insertBefore(t,document.body.firstChild)),t.className+=" preload",t.setAttribute("role","complementary"),t.setAttribute("aria-label","University of Central Florida navbar"),t.innerHTML='\n<div id="ucfhb-inner" style="display: none;">\n  <div id="ucfhb-left">\n    <div id="ucfhb-logo">\n      <a href="https://www.ucf.edu" aria-label="University of Central Florida"></a>\n    </div>\n    <button id="ucfhb-mobile-toggle" aria-controls="ucfhb-right" aria-expanded="false" aria-label="Toggle Mobile Menu"></button>\n  </div>\n  <div id="ucfhb-right">\n    <div id="ucfhb-signon">\n      <button id="ucfhb-signon-logo" aria-controls="ucfhb-services" aria-expanded="false" aria-label="UCF Sign In"></button>\n      <div id="ucfhb-services">\n        <div>\n          <a id="ucfhb-myucf" class="ucfhb-service" href="https://my.ucf.edu/psp/IHPROD/EMPLOYEE/EMPL/?cmd=login" aria-label="myUCF"></a>\n          <a id="ucfhb-knightsmail" class="ucfhb-service" href="http://knightsemail.ucf.edu" aria-label="KnightsMail"></a>\n          <a id="ucfhb-webcourses" class="ucfhb-service" href="https://webcourses.ucf.edu" aria-label="Webcourses"></a>\n        </div>\n      </div>\n    </div>\n    <div id="ucfhb-search">\n      <form action="//search.ucf.edu/" data-action-url="//search.ucf.edu#?q=" method="get" name="ucfhb-search-form" id="ucfhb-search-form">\n        <label for="ucfhb-search-field" id="ucfhb-search-field-label">Search UCF</label>\n        <input type="text" name="#q" id="ucfhb-search-field" placeholder="Search UCF" />\n        <button type="submit" value="Search" id="ucfhb-search-submit" aria-label="Submit"></button>\n      </form>\n      <button id="ucfhb-search-minimal" aria-controls="ucfhb-search" aria-expanded="true" aria-label="Search"></button>\n    </div>\n  </div>\n</div>\n    '.trim(),e()};function n(e){"readystatechange"==e.type&&"complete"!=c.readyState||(("load"==e.type?t:c)[E](r+e.type,n,!1),!v&&(v=!0)&&g.call(t,e.type||e))}function p(){try{y.doScroll("left")}catch(e){return void setTimeout(p,50)}n("poll")}var v=!1,a=!0,c=t.document,y=c.documentElement,UCFHB_VERSION=c.addEventListener?"addEventListener":"attachEvent",E=c.addEventListener?"removeEventListener":"detachEvent",r=c.addEventListener?"":"on";if("complete"==c.readyState)g.call(t,"lazy");else{if(c.createEventObject&&y.doScroll){try{a=!t.frameElement}catch(e){}a&&p()}c[UCFHB_VERSION](r+"DOMContentLoaded",n,!1),c[UCFHB_VERSION](r+"readystatechange",n,!1),t[UCFHB_VERSION](r+"load",n,!1)}}}();