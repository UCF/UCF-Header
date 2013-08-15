<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>University Header Prototyping</title>

<style type="text/css">
	@import url('../css/bootstrap.min.css');
	@import url('../css/demo-extras.css');	
	/*@import url('css/bootstrap-responsive.min.css');*/
	
	
	/* Inverted UCF Header */
	#ucfhb { height: 50px; width: 100%; margin: auto; background: #ffc904; }
	
	#ucfhb-inner { width: 940px; margin: auto; }
	#ucfhb-logo { float: left; padding-top: 13px; width: 265px; }

	#ucfhb-right { float: right; }
	#ucfhb-rolenav { float: left; }
	#ucfhb-rolenav ul { list-style-type: none; }
	#ucfhb-rolenav ul li { float: left; padding: 0 7px; }
	#ucfhb-rolenav ul li a { 
		font-family: 'Helvetica-Neue', sans-serif; 
		font-size: 14px; 
		font-weight: 200; 
		color: #000; 
		text-decoration: none; 
		line-height: 50px;
	}
	#ucfhb-rolenav ul li a:hover { text-decoration: underline; }
	#ucfhb-campaign { float: left; padding-top: 7px; }
	
	
	/* UCF.edu's Navigation */
	#edu-nav-top { width: 100%; background: #000; }
	#edu-nav-top .container .row { position: relative; overflow: visible; }
	#edu-nav-top #ucf-logo { position: absolute; top: 14px; left: -52px; }
	#edu-nav-top ul { list-style-type: none; margin: 0; }
	#edu-nav-top ul li { float: left; margin-right: 20px; padding-top: 18px; }
	#edu-nav-top ul li,
	#edu-nav-top ul li a {
		font-family: Georgia, serif;
		font-size: 20px;
		color: #fff;
		line-height: 60px;
	}
	
	#edu-nav-top #search-wrapper form.form-search { margin: 0; float: right; padding-top: 30px; }
	#edu-nav-top #search-wrapper form.form-search input { width: 154px; padding-right: 40px; background: #fff url('../img/assets/search.png') 175px center no-repeat; }
	
	
	/* Search AutoSuggest */
	#ucfhb-search-autocomplete { 
		display: none;
		list-style-type: none;
		margin: 0;
		position: absolute;
		right: -5px;
		top: 64px;
		width: 218px;
		z-index: 999;
		background: #fff;
		border-radius: 4px;
		border: 1px solid #ddd;
		padding: 0;
	}
	#ucfhb-search-autocomplete.ucfhb-shiftleft { display: none; }
	#ucfhb-search-autocomplete.search-is-active { display: block; }
	#ucfhb-search-autocomplete li {
		display: block;
		padding: 4px 8px !important;
		border-top: 1px solid #ddd;
		margin: 0 !important;
		width: 202px;
	}
	#ucfhb-search-autocomplete li:first-child { border-top: 0; }
	#ucfhb-search-autocomplete li:hover {
		background: #efefef;
	}
	#ucfhb-search-autocomplete li#ucfhb-search-autocomplete-more {
		border-top: 0;
		text-align: right;
		padding-bottom: 4px;
		padding-top: 0;
	}
	#ucfhb-search-autocomplete li#ucfhb-search-autocomplete-more:hover { background: #fff; }
	#ucfhb-search-autocomplete li#ucfhb-search-autocomplete-more a { font-size: 11px; }
	#ucfhb-search-autocomplete li a {
		font-family: Helvetica, sans-serif; 
		font-size: 14px; 
		line-height: 20px; 
		color: #0088CC;
		text-decoration: none;
		width: 100%;
		display: block;
	}
	#ucfhb-search-autocomplete li a:hover { text-decoration: underline; color: #005580; }
	#ucfhb-search-autocomplete li a.ucfhb-search-autocomplete-url { 
		font-size: 11px; 
		text-align: left; 
		line-height: 16px; 
		font-family: Helvetica, sans-serif; 
		color: #008000;
		text-decoration: none;
		width: 100%;
		display: block;
	}
	#ucfhb-search-autocomplete li a.ucfhb-search-autocomplete-url:hover { text-decoration: underline; }
	
	
	#ucfhb-search-autocomplete li p { text-align: left; }
	#ucfhb-search-autocomplete li p.ucfhb-search-autocomplete-name {
		font-family: Helvetica, sans-serif;
		font-size: 13px;
		line-height: 17px;
		font-weight: bold;
		margin-bottom: 0;
		color: #000;
	}
	#ucfhb-search-autocomplete li p.ucfhb-search-autocomplete-org {
		font-family: Helvetica, sans-serif;
		font-size: 11px;
		line-height: 15px;
		margin-bottom: 0;
		color: #666;
	}
	#ucfhb-search-autocomplete li p.ucfhb-search-autocomplete-phone {
		font-family: Helvetica, sans-serif;
		font-size: 11px;
		line-height: 15px;
		margin-bottom: 0;
		margin-top: 2px;
		color: #000;
	}
	
	
	/* UCF.edu's Subnavigation */
	#edu-nav-bottom { 
		width: 100%; 
		background: #1b1b1b; 
		border-top: 1px solid #343434; 
		border-bottom: 1px solid #343434; 
		box-shadow: 0 1px 7px 1px rgba(0,0,0,0.3);
		position: relative;
	}
	#edu-nav-bottom ul { list-style-type: none; float: right; margin-bottom: 0; }
	#edu-nav-bottom ul li { float: left; margin-left: 16px; padding: 5px 0; }
	#edu-nav-bottom ul li,
	#edu-nav-bottom ul li a { 
		text-transform: uppercase;
		font-size: 10px;
		line-height: 18px;
		letter-spacing: 2px;
		color: #888;
	}
	
	
	/* Other demo functionality styles */	
	.screenshot { display: none; margin: auto; }
	.screenshot.active { display: block; }
	
	
	#tiny-myucf { display: none; }
	
</style>


<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" ></script>
<script>
	window.onload = function() {
		$('#ucf-logo, #nav-wrapper ul li a, #subnav-wrapper ul li a').click(function(e) {
			var img = $(this).attr('href');
			if (img.substr(0,1) == '#' && img !== '#myucf') {
				e.preventDefault();
				$('.screenshot.active').removeClass('active');
				$(img).addClass('active');
			}
		});
		$('a[href="#myucf"]').click(function() {
			$('#tiny-myucf').toggle('fast');
		});
		
		
		
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
</script>


</head>

<body>

	<div id="ucfhb">
		<div id="ucfhb-inner">
			<div id="ucfhb-logo">
				<a href="index.php"><img src="../img/assets/ucflogo-black-noflourish.png" alt="University of Central Florida" title="University of Central Florida" /></a>
			</div>
			<div id="ucfhb-right">
				<div id="ucfhb-rolenav">
					<ul>
						<li><a href="#">Students</a></li>
						<li><a href="#">Faculty</a></li>
						<li><a href="#">Staff</a></li>
						<li><a href="#">Alumni</a></li>
						<li><a href="#">Parents</a></li>
						<li><a href="#">Visitors</a></li>
					</ul>
				</div>
				<div id="ucfhb-campaign">
					<a href="campaign.php"><img src="../img/assets/campaign-btn.png" alt="UCF Campaign" title="UCF Campaign" /></a>
				</div>
			</div>
		</div>
	</div>
	
	<div id="edu-nav-top">
		<div class="container">
			<div class="row">
				<a id="ucf-logo" href="#home"><img src="../img/assets/pegasus-large.png" alt="Home" title="Home" /></a>
				<div class="span9" id="nav-wrapper">
					<ul>
						<li>Academics</li>
						<li>Admissions</li>
						<li><a href="#research">Research</a></li>
						<li>Campus Life</li>
						<li>Locations</li>
						<li>Athletics</li>
					</ul>
				</div>
				<div class="span3" id="search-wrapper">
					<form action="http://google.cc.ucf.edu/search" data-autosearch-url="../../../people/service.php?limit=5&search=" method="get" name="ucfhb-search-form" id="ucfhb-search-form" autocomplete="off" class="form-search">
						<input type="hidden" name="client" value="default_frontend" />
						<input type="hidden" name="proxystylesheet" value="UCF_Main" />
						<input type="text" name="q" id="ucfhb-search-field" class="input-medium search-query" placeholder="Search UCF" />
					</form>
				</div>
				<ul id="ucfhb-search-autocomplete">
					<!--
					<li>
						<a href="http://today.ucf.edu/"><strong>UCF</strong> Today</a>
						<a class="ucfhb-search-autocomplete-url" href="http://today.ucf.edu/">today.ucf.edu/</a>
					</li>
					<li>
						<a href="http://www.ucf.edu/alert/"><strong>UCF</strong> Alert</a>
						<a class="ucfhb-search-autocomplete-url" href="http://www.ucf.edu/alert/">www.ucf.edu/alert/</a>
					</li>
					<li>
						<a href="http://www.ce.ucf.edu/"><strong>UCF</strong> Continuing Education | 407.882.0260</a>
						<a class="ucfhb-search-autocomplete-url" href="http://www.ce.ucf.edu/">www.ce.ucf.edu/</a>
					</li>
					<li>
						<a href="http://www.ucf.edu/azindex/">AZ Index</a>
						<a class="ucfhb-search-autocomplete-url" href="http://www.ucf.edu/azindex/">www.ucf.edu/azindex/</a>
					</li>
					<li>
						<a href="http://hr.ucf.edu/">Human Resources</a>
						<a class="ucfhb-search-autocomplete-url" href="http://hr.ucf.edu/">hr.ucf.edu/</a>
					</li>
					<li id="ucfhb-search-autocomplete-more">
						<a href="#">More Results</a>
					</li>
					-->
				</ul>
			</div>
		</div>
	</div>
	<div id="edu-nav-bottom">
		<div class="container">
			<div class="row">
				<div class="span10 offset2" id="subnav-wrapper">
					<form style="margin: 0px; width: 335px;float:left;" id="tiny-myucf">
						<input type="text" value="Your PID" style="width:120px; margin:0; height: 11px;margin-top:4px;font-size:11px;">
						<input type="password" value="PID Password" style="width:120px; margin:0; height: 11px;margin-top:4px;font-size:11px;">
						<input class="btn btn-small" type="submit" style="float: right;margin-top:4px;" value="Log In">
					</form>
					<ul>
						<li><a href="#myucf">MyUCF</a></li>
						<li>News</li>
						<li><a href="events.php">Events</a></li>
						<li><a href="#directories">Directories</a></li>
						<li>Map</li>
						<li>Libraries</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
	
	<p style="width: 100%; display: block;">
		<img class="screenshot active" id="home" src="../img/ucf-edu-nonav.jpg" />
		<img class="screenshot" id="research" src="../img/ucf-edu-research.jpg" />
		<img class="screenshot" id="directories" src="../img/directories.jpg" />
	</p>
	
<?php include('includes/html-navigation.html'); ?>