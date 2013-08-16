/* University Header Auto-Suggest Search Result functionality */
function autocomplete(acCloseBtn, acList, searchForm, searchField, searchService) {
	var self = this;

	this.autocompleteCloseBtn	= acCloseBtn;
	this.autocompleteList		= acList;
	this.searchForm				= searchForm;
	this.searchField			= searchField;
	this.searchService			= searchService;

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
	
	// Output a search query's results:
	this.outputResults = function(url, q) {
		// First, clear existing results
		self.clearAutocompleteResults();
		
		// Make sure there is actually a query to search for
		if (q !== '') {
			// Make sure our query is URL encoded
			q = encodeURIComponent(q);

			loadSearchContent(url, function(xhr) {
				var json = JSON.parse(xhr.responseText);
				
				// If data was returned, append the results to the
				// autocomplete <ul>
				if (json.results !== null && json.results.length > 0) {
					self.autocompleteList.className = 'search-is-active';
					
					for (i = 0; i < json.results.length; i++) {
						// TODO: trim() is unsupported before IE9!!
						var name 	= json.results[i].name != null 			? '<span class="ucfhb-search-autocomplete-name">' + json.results[i].name.trim() + '</span>' : '',
							org 	= json.results[i].organization != null 	? '<span class="ucfhb-search-autocomplete-org">' + json.results[i].organization + '</span>' : '',
							phone 	= json.results[i].phone != null 		? '<span class="ucfhb-search-autocomplete-phone">' + json.results[i].phone + '</span>' : '';
							
						var listItem = document.createElement('li');
						listItem.innerHTML = name + org + phone;
						self.autocompleteList.appendChild(listItem);
					}
					// Append a link to Google's search results @ bottom of list
					var viewMoreLi = document.createElement('li');
					var viewMoreLink = self.searchForm.getAttribute('data-action-url') + q;
					viewMoreLi.innerHTML = '<a href="' + viewMoreLink + '">View More Results &raquo;</a>';
					self.autocompleteList.appendChild(viewMoreLi);
				}
			});
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
	
	// Listen for events (keyup in searchfield, close btn click)
	this.handleEvents = function() {
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
	ucfhbAutocomplete.handleEvents();
};