window.onload = function() {
	/* University Header Auto-Suggest Search Result functionality */
	var searchForm 		= document.getElementById('ucfhb-search-form'),
		searchField 	= document.getElementById('ucfhb-search-field'),
		searchService 	= searchForm.getAttribute('data-autosearch-url'),
		q				= encodeURIComponent(searchField.value),
		query			= searchService + q;
	  
	// Load in a search query:  
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
	
	// Debug feed load:
	//loadSearchContent(query, function(xhr) {  
	//	console.log(xhr.responseHTML);  
	//}); 
	
	// Output a search query's results:
	function outputResults(url, q) {	
		var autocompleteList = document.getElementById('ucfhb-search-autocomplete');
		
		// Clear any existing results
		while (autocompleteList.hasChildNodes()) {
			autocompleteList.removeChild(autocompleteList.lastChild);
		}
		
		// Make sure there is actually a query to search for
		if (q !== '') {				
			loadSearchContent(url, function(xhr) {
				//alert('test');
				var json = JSON.parse(xhr.responseText);
				
				// If data was returned, append the results to the
				// autocomplete <ul>
				if (json.results !== null && json.results.length > 0) {
					autocompleteList.className = 'search-is-active';
					
					for (i = 0; i < json.results.length; i++) {
						// Note: trim() is unsupported before IE9!!
						var name 	= json.results[i].name != null 			? '<p class="ucfhb-search-autocomplete-name">' + json.results[i].name.trim() + '</p>' : '',
							org 	= json.results[i].organization != null 	? '<p class="ucfhb-search-autocomplete-org">' + json.results[i].organization + '</p>' : '',
							phone 	= json.results[i].phone != null 		? '<p class="ucfhb-search-autocomplete-phone">' + json.results[i].phone + '</p>' : '';
							
						var listItem = document.createElement('li');
						listItem.innerHTML = name + org + phone;
						autocompleteList.appendChild(listItem);
					}	
				}
			});
		}
		// If there is no query, make sure the autocomplete
		// list is not visible
		else {
			autocompleteList.className = '';
		}
	}
	
	// Perform outputResults() when a query is
	// being typed in the search bar:
	var timer;
	function searchOnKeyUp(searchService, q, query) {
		clearTimeout(timer);
		
		if (q != encodeURIComponent(searchField.value)) {
			q = encodeURIComponent(searchField.value);
		}
		if (query != searchService + q) {
			query = searchService + q;
		}
		
		//console.log('q is: ' + q);
		//console.log('query is: ' + query);
		
		timer = setTimeout(function (){ 
		
			//console.log('query in setTimeout is: ' + query);
		
			outputResults(query, q);
		}, 1000);
	}
	
	// Handle the onkeyup event for autosearching:
	searchForm.onkeyup = function() {
		searchOnKeyUp(searchService, q, query);
	}
}