<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<title>University Header Prototyping</title>

<style type="text/css">
	/*
	@import url('css/reset.css');
	
	em { font-style: italic; }
	p { text-align: center; }
	#meta-nav { position: fixed; bottom: 20px; background: rgba(255,255,255,0.8); width: 100%; padding: 20px 0; }
	#meta-nav a { font-weight: bold; }
	
	#ucfhb { height: 50px; width: 1280px; margin: auto; background: #ffc904; }
	
	#ucfhb-inner { width: 940px; margin: auto; }
	#ucfhb-logo { float: left; padding-top: 20px; width: 254px; }

	#ucfhb-right { float: right; }
	#ucfhb-myucf { float: left; padding-right: 5px; }
	#ucfhb-myucf-logo { display: block; font-size: 14px; color: #aa8912; text-decoration: none; height: 50px; }
	#ucfhb-myucf-logo img { float: left; padding-top: 13px; }
	#ucfhb-myucf-logo .ucfhb-icon { padding: 19px 0 0 8px; display: block; float: left; }
	
	#ucfhb-campaign { float: left; padding-top: 7px; }
	
	.ucfhb-divider { float: left; height: 30px; width: 1px; border-left: 1px solid #caa31b; margin: 10px 5px 0 5px; }
	.ucfhb-icon { font-family: 'Helvetica-Neue', sans-serif; }
	
	*/
	
	
	@import url('../css/bootstrap.min.css');
	@import url('../css/demo-extras.css');	
	
	/* Main wrapper */
	#ucfhb { height: 50px; width: 100%; margin: auto; background: #ffc904; position: relative; z-index: 999; }
	
	/* Inner wrap (fixed 940px width) */
	#ucfhb-inner { width: 940px; margin: auto; /*overflow: hidden;*/ height: 50px; position: relative; }
	
	/* The Logo */
	#ucfhb-logo { float: left; padding-top: 15px; width: 291px; }
	#ucfhb-logo img { vertical-align: middle; }

	/* The right-hand portion of the header */
	#ucfhb-right { float: right; position: relative; width: 600px; height: 50px; overflow: hidden; }
	
	/* MyUCF: button */
	#ucfhb-myucf { 
		float: left; 
		position: absolute;
		top: 0;
		right: 50px;
		width: 500px;
		height: 50px;
	}
	
	#ucfhb-myucf-logo { 
		display: block; 
		font-size: 14px; 
		color: #aa8912; 
		text-decoration: none; 
		width: 85px; 
		height: 50px; 
		position: absolute;
		right: 193px;
		top: 0;
		transition: right 0.4s ease-in-out; /* 'move' left */
    	-webkit-transition: right 0.4s ease-in-out;
    	-ms-transition: right 0.4s ease-in-out;
		z-index: 2;
		outline: 0;
	}
	#ucfhb-myucf-logo.ucfhb-shiftleft {
		right: 392px;
	}
	#ucfhb-myucf-logo img { float: left; padding-top: 13px; vertical-align: middle; }
	.ucfhb-icon { font-family: 'Helvetica-Neue', sans-serif; line-height: 14px; }
	#ucfhb-myucf-logo .ucfhb-icon { padding: 19px 0 0 8px; display: block; float: left; }
	#ucfhb-myucf-logo #ucfhb-icon-close { display: none; }
	#ucfhb-myucf-logo.ucfhb-shiftleft #ucfhb-icon-open { display: none; }
	#ucfhb-myucf-logo.ucfhb-shiftleft #ucfhb-icon-close { display: block; }
	
	/* MyUCF: login form */
	#ucfhb-myucf-login { position: absolute; top: 0; right: 5px; width: 380px; height: 50px; z-index: 1; }
	#ucfhb-myucf-login form { 
		display: block;
		opacity: 0;
		visibility: hidden;
		-webkit-transition: all 0s linear 0s; /* Force immediate hide of form fields */
		-ms-transition: all 0s linear 0s;
		transition: all 0s linear 0s;
		height: 0;
		width: 0;
		position: absolute;
		top: 7px;
		right: 0;
	}
	#ucfhb-myucf-login form input[type="text"],
	#ucfhb-myucf-login form input[type="password"] { 
		float: left; 
		width: 140px; 
		margin: 4px 2px; 
		padding: 5px 4px; 
		font-family: 'Helvetica-Neue', sans-serif;
		font-size: 12px; 
		height: 17px;
	}
	#ucfhb-myucf-login form input[type="submit"] { 
		float: left; 
		display: block;
		width: 56px;
		height: 33px;
		background: url('../img/assets/myucf-login-gold.png') center center no-repeat;
		cursor: pointer;
		text-indent: -9999px;
		border: 0;
		padding: 0;
		margin-left: 5px;
		margin-top: 3px;
	}
	#ucfhb-myucf-login form input[type="submit"]:hover {
		background: url('../img/assets/myucf-login-gold-lighter.png') center center no-repeat;
	}
	
	.ucfhb-shiftleft + #ucfhb-myucf-login form { 
		opacity: 1;
		visibility: visible;
		height: auto;
		width: 380px;
		-webkit-transition: opacity 0.2s ease-in 0.4s; /* Show the form field after the button has 'moved' left */
		-ms-transition: opacity 0.2s ease-in 0.4s;
		transition: opacity 0.2s ease-in 0.4s;
	}
	
	/* Search */
	#ucfhb-search { 
		position: absolute;
		top: 0;
		right: 4px;
		margin-top: 10px; 
		padding-left: 10px; 
		border-left: 1px solid #caa31b;
		z-index: 2;
		width: 220px;
		height: 31px;
		transition: width 0.4s ease-in-out; /* shrink to the right */
    	-webkit-transition: width 0.4s ease-in-out;
    	-ms-transition: width 0.4s ease-in-out;
	}
	#ucfhb-search form { 
		width: 220px;
		height: 29px; 	
	}
	#ucfhb-search form input { 
		width: 160px; 
		height: 25px; 
		border-radius: 30px; 
		border: 0; 
		padding: 2px 45px 2px 15px; 
		font-family: 'Helvetica-Neue', sans-serif;
		font-size: 13px;
		letter-spacing: 0.1px;
		background: #fff url('../img/assets/search.png') 188px center no-repeat;
		-webkit-appearance: none;
		box-shadow: inset 0 2px 3px 0 rgba(0, 0, 0, 0.25), 0 0 0 0 transparent; 
		transition: all 0.2s ease-in-out; /* glow effect */
    	-webkit-transition: all 0.2s ease-in-out;
    	-ms-transition: all 0.2s ease-in-out;
	}
	#ucfhb-search form input:focus {
		outline: none;
		box-shadow: inset 0 2px 3px 0 rgba(0, 0, 0, 0.25), 0px 0px 5px 2px rgba(253, 240, 183, 0.6);
	}
	
	#ucfhb-search.ucfhb-shiftleft {
		width: 32px;
		overflow: hidden;
	}
	
	#ucfhb-search.ucfhb-shiftleft form { 
		display: block;
		width: 0;
		opacity: 0;
		height: 0;
		overflow: hidden;
		
		transition: width 0.4s ease-in-out; /* grow back to the left */
    	-webkit-transition: width 0.4s ease-in-out;
    	-ms-transition: width 0.4s ease-in-out;
	}
	
	#ucfhb-search-minimal {
		display: none;
		width: 20px;
		height: 25px;
		padding: 5px 6px 1px 6px; 
		border-radius: 5px; 
		background: #DBAC04;
		position: absolute;
		top: 0;
		-webkit-transition: all 0.2s ease-in 0.4s; /* Show the search button after myucf has 'moved' left */
		-ms-transition: all 0.2s ease-in 0.4s;
		transition: all 0.2s ease-in 0.4s;
	}
	#ucfhb-search-minimal img { width: 0; height: 0; vertical-align: top; }
	#ucfhb-search-minimal.ucfhb-shiftleft { 
		display: block;
		-webkit-transition: all 0s linear 0s; /* Force immediate hide when myUCF is shifted back right */
		-ms-transition: all 0s linear 0s;
		transition: all 0s linear 0s;
	}
	#ucfhb-search-minimal.ucfhb-shiftleft img { width: auto; height: auto; }
	
	
	#ucfhb-search-autocomplete { 
		display: none;
		list-style-type: none;
		margin: 0;
		position: absolute;
		right: 4px;
		top: 42px;
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
		padding: 4px 8px;
		border-top: 1px solid #ddd;
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
	}
	
	
	
	/* UCF.edu's Navigation */
	#edu-nav-top { width: 100%; background: #000; position: relative; z-index: 1; }
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
	
	#edu-nav-top #campaign-wrapper { padding-top: 32px; }
	
	
	/* UCF.edu's Subnavigation */
	#edu-nav-bottom { 
		width: 100%; 
		background: #1b1b1b; 
		border-top: 1px solid #343434; 
		border-bottom: 1px solid #343434; 
		box-shadow: 0 1px 7px 1px rgba(0,0,0,0.3);
		position: relative;
		z-index: 1;
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
	
</style>

<script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js" ></script>
<script>	
	window.onload = function() {
		/* University Header MyUCF Sliding functionality */
		var myUCFBtn = document.getElementById('ucfhb-myucf-logo'),
			myUCFWrapper = document.getElementById('ucfhb-myucf'),
			searchbar = document.getElementById('ucfhb-search'),
			searchMinimal = document.getElementById('ucfhb-search-minimal'),
			searchAutocomplete = document.getElementById('ucfhb-search-autocomplete'),
			elemArray = [myUCFBtn, searchbar, searchMinimal, searchAutocomplete];
		
		var toggleClasses = function(elems, newClassName) {
			var length = elems.length;
			for (var i=0; i<length; i++) {
				elems[i].className = newClassName;
			}
		}
		
		myUCFBtn.onclick = function() {
			if (myUCFBtn.className == 'ucfhb-shiftleft') {
				toggleClasses(elemArray, '');
			}
			else {
				toggleClasses(elemArray, 'ucfhb-shiftleft');
			}
		}
		searchMinimal.onclick = function() {
			toggleClasses(elemArray, '');
		}
		

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
		
		
		
		/* Demo screenshot switching */
		$('#ucf-logo, #nav-wrapper ul li a, #subnav-wrapper ul li a').click(function(e) {
			var img = $(this).attr('href');
			if (img.substr(0,1) == '#') {
				e.preventDefault();
				$('.screenshot.active').removeClass('active');
				$(img).addClass('active');
			}
		});
	}
</script>

</head>

<body>

	<div id="ucfhb">
		<div id="ucfhb-inner">
			<div id="ucfhb-logo">
				<a href="#"><img src="../img/assets/ucflogo-black-flourish.png" alt="University of Central Florida" title="University of Central Florida" /></a>
			</div>
			<div id="ucfhb-right">
				<div id="ucfhb-myucf">
					<a id="ucfhb-myucf-logo" href="#">
						<img src="../img/assets/myucf-blacktext.png" />
						 <span class="ucfhb-icon" id="ucfhb-icon-open">+</span>
						 <span class="ucfhb-icon" id="ucfhb-icon-close">&raquo;</span>
					</a>
					<div id="ucfhb-myucf-login">
						<form action="">
							<input name="userid" type="text" placeholder="Your PID" />
							<input name="pwd" type="password" placeholder="PID Password" />
							<input name="Submit" type="submit" value="Log In" />
						</form>
					</div>
				</div>
				<div id="ucfhb-search">
					<form action="http://google.cc.ucf.edu/search" data-autosearch-url="../../../people/service.php?limit=5&search=" method="get" name="ucfhb-search-form" id="ucfhb-search-form" autocomplete="off">
						<input type="hidden" name="client" value="default_frontend" />
						<input type="hidden" name="proxystylesheet" value="UCF_Main" />
						<input type="text" name="q" id="ucfhb-search-field" placeholder="Search UCF" />
					</form>
					<a id="ucfhb-search-minimal" href="#"><img src="../img/assets/search.png" alt="Search" title="Search" /></a>
				</div>
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
				<div class="span3" id="campaign-wrapper">
					<a href="campaign.php"><img src="../img/assets/campaign-btn.png" alt="Campaign for UCF" title="Campaign for UCF" /></a>
				</div>
			</div>
		</div>
	</div>
	<div id="edu-nav-bottom">
		<div class="container">
			<div class="row">
				<div class="span6 offset6" id="subnav-wrapper">
					<ul>
						<li>MyUCF</li>
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
	
	<p id="ajax"></p>
	
	
	<?php include('includes/html-navigation.html'); ?>