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
function autocomplete(acCloseBtn, acList, searchForm, searchField, searchService) {
	var self = this;

	this.autocompleteCloseBtn	= acCloseBtn;
	this.autocompleteList		= acList;
	this.searchForm				= searchForm;
	this.searchField			= searchField;
	this.searchService			= searchService;
	this.keyterms				= null;
	this.keytermsUrl			= '../js/keyterms.json';

	this.q						= encodeURIComponent(this.searchField.value);
	this.query					= this.searchService + this.q;

	var timer;

	// Load in a search query (private):  
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

	// Delete existing results in an autocomplete list
	this.clearAutocompleteResults = function() {
		while (self.autocompleteList.hasChildNodes()) {
			self.autocompleteList.removeChild(self.autocompleteList.lastChild);
		}
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
	this.outputResults = function(url, q) {
		// First, clear existing results
		self.clearAutocompleteResults();
		
		// Make sure there is actually a query to search for
		if (q !== '') {
			q = q.toLowerCase();

			// Search against keyterm list first.
			if (self.keyterms.terms) {
				i = 0;
				var terms = self.keyterms.terms,
					matches = self.keyterms.matches;
				for (i = 0; i < countObjectProperties(terms); i++) {
					var termKey = "t_" + (i + 1),
						matchKey = "m_" + (i + 1);
					if (terms[termKey].indexOf(q) > -1) {
						self.autocompleteList.className = 'search-is-active';
						var name = matches[matchKey].name !== null	? '<span class="ucfhb-search-autocomplete-name">' + matches[matchKey].name.trim() + '</span>' : '',
							link = matches[matchKey].url !== null	? '<a class="ucfhb-search-autocomplete-url" href="' + matches[matchKey].url.trim() + '">' + matches[matchKey].url.trim() + '</a>' : '';
						var listItem = document.createElement('li');
						listItem.innerHTML = name + link;
						if (terms[termKey][i] !== q) {
							self.autocompleteList.insertBefore(listItem, self.autocompleteList.firstChild);
						}
						else {
							self.autocompleteList.appendChild(listItem);
						}
					}
				}
			}

			// Search the search service if no keyterm results
			if (self.autocompleteList.hasChildNodes() === false) {
				loadSearchContent(url, function(xhr) {
					var json = JSON.parse(xhr.responseText);
					
					// If data was returned, append the results to the
					// autocomplete <ul>
					if (json.results !== null && json.results.length > 0) {
						self.autocompleteList.className = 'search-is-active';
						i = 0;
						for (i = 0; i < json.results.length; i++) {
							// TODO: trim() is unsupported before IE9!!
							var name	= json.results[i].name !== null				? '<span class="ucfhb-search-autocomplete-name">' + json.results[i].name.trim() + '</span>' : '',
								org		= json.results[i].organization !== null		? '<span class="ucfhb-search-autocomplete-org">' + json.results[i].organization.trim() + '</span>' : '',
								phone	= json.results[i].phone !== null			? '<span class="ucfhb-search-autocomplete-phone">' + json.results[i].phone.trim() + '</span>' : '';
								
							var listItem = document.createElement('li');
							listItem.innerHTML = name + org + phone;
							self.autocompleteList.appendChild(listItem);
						}
					}
				});
			}

			// Append a link to Google's search results @ bottom of list
			// if either search attempt returned results
			if (self.autocompleteList.hasChildNodes() === true) {
				// Make sure our query is URL encoded
				q = encodeURIComponent(q);

				var viewMoreLi = document.createElement('li');
				var viewMoreLink = self.searchForm.getAttribute('data-action-url') + q;
				viewMoreLi.innerHTML = '<a href="' + viewMoreLink + '">View More Results &raquo;</a>';
				self.autocompleteList.appendChild(viewMoreLi);
			}
			// Make sure we hide the list if it's already visible and no
			// results are returned
			else {
				self.autocompleteList.className = '';
			}
		}
		// If there is no query, make sure the autocomplete
		// list is not visible
		else {
			self.autocompleteList.className = '';
		}
	};
	
	// Perform outputResults() when a query is
	// being typed in the search bar:
	this.searchOnKeyUp = function(searchService, q, query) {
		clearTimeout(timer);
		
		if (q != encodeURIComponent(searchField.value)) {
			q = encodeURIComponent(searchField.value);
		}
		if (query != searchService + q) {
			query = searchService + q;
		}
		timer = setTimeout(function (){
			self.outputResults(query, q);
		}, 600);
	};
	
	// On load + listen for events
	this.initialize = function() {
		// Retrieve the keyterm list on load
		self.getKeytermList();
		// Handle the onkeyup event for autosearching:
		self.searchForm.onkeyup = function() {
			self.searchOnKeyUp(self.searchService, self.q, self.query);
		};
		// Handle autocomplete close btn click
		self.autocompleteCloseBtn.onclick = function() {
			self.clearAutocompleteResults();
			self.autocompleteList.className = '';
		};
	};
}

window.onload = function() {
	var ucfhbAcCloseBtn				= document.getElementById('ucfhb-search-autocomplete-close'),
		ucfhbAcList					= document.getElementById('ucfhb-search-autocomplete'),
		ucfhbSearchForm				= document.getElementById('ucfhb-search-form'),
		ucfhbSearchField			= document.getElementById('ucfhb-search-field'),
		ucfhbSearchService			= ucfhbSearchForm.getAttribute('data-autosearch-url');

	var ucfhbAutocomplete = new autocomplete(ucfhbAcCloseBtn, ucfhbAcList, ucfhbSearchForm, ucfhbSearchField, ucfhbSearchService);
	ucfhbAutocomplete.initialize();
};