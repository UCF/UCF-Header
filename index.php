<!DOCTYPE html>
<html>
	<head>
		<title>UCF University Header</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link media="all" type="text/css" href="http://www.ucf.edu/wp-content/themes/Main-Site-Theme/static/bootstrap/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<link media="all" type="text/css" href="http://www.ucf.edu/wp-content/themes/Main-Site-Theme/static/bootstrap/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet">
		<link media="all" type="text/css" href="http://www.ucf.edu/wp-content/themes/Main-Site-Theme/static/css/webcom-base.css" rel="stylesheet">
		<script id="ucfhb-script" src="http://webcom.dev.smca.ucf.edu/UCF-Header/bar/js/university-header.js?use-bootstrap-overrides=1"></script>
		<style type="text/css">
			h1 { padding-top: 20px; }
		</style>
	</head>
	<body>
		<div class="container">
			<div class="row">
				<div class="span12">
					<h1>University Header</h1>
					<p>
						The UCF University Header is a single, cohesive marketing and branding tool for the entire university, which provides 
						consistent navigational elements and a universal search feature with search suggestions.
					</p>
					<p>
						The university header has a responsive option and will adapt to various screen sizes as necessary.  Responsiveness follows 
						<a href="http://getbootstrap.com"><strong>Twitter Bootstrap's</strong></a> scaffolding standards.
					</p>

					<h2>Standard Installation</h2>
					<p>
						To add the University Header to your website, add the following script tag to your document.  We recommend placing it in the footer of 
						your document to help reduce load times, but you can place it in the header if necessary.
					</p>
					<p>
						<i class="icon-info-sign"></i> If you've included the old version of the University Header on your website, your site should display the new bar automatically 
						without any modifications.
					</p>
					<pre>&lt;script type="text/javascript" id="ucfhb-script" src="http://universityheader.ucf.edu/bar/js/university-header.js"&gt;&lt;/script&gt;</pre>
					<p>
						<i class="icon-info-sign"></i> <strong>Note:</strong> A minified version of the script is also available at <code>university-header.min.js</code>.  
						Use this version to help reduce page load times.
					</p>


					<h2>Options</h2>
					<h3>Responsiveness</h3>
					<p>
						To utilize a responsive bar, simply make sure your site's <code>&lt;head&gt;</code> includes the following <code>&lt;meta&gt;</code> tag:
					</p>
					<pre>&lt;meta name="viewport" content="width=device-width, initial-scale=1.0"&gt;</pre>

					<h3>Reduce flicker effect</h3>
					<p>
						To reduce the flicker effect of loaded header content on larger sites, add the below markup
						as the <em>very first</em> child element of your <code>&lt;body&gt;</code>.
						<br/>
						<i class="icon-info-sign"></i> <strong><em>Note: The University Header must always be the first element
						at the top of the screen.</em></strong>
					</p>
					<pre>&lt;div id="ucfhb" style="height: 50px; width: 100%; margin: auto; background: #222; position: relative; z-index: 999;"&gt;&lt;/div&gt;</pre>

					<h3>Bootstrap 2.x overrides</h3>
					<p>
						Due to the way that older versions of Bootstrap apply left- and right-hand padding to elements at screen sizes less than 768px wide, 
						a style override is necessary for sites using these versions of Bootstrap.  These overrides can also be used for any other framework 
						that applies 20px of left- and right-hand padding to the <code>&lt;body&gt;</code>.
					</p>
					<pre>&lt;script type="text/javascript" id="ucfhb-script" src="http://universityheader.ucf.edu/bar/js/university-header.js?use-bootstrap-overrides=1"&gt;&lt;/script&gt;</pre>
					<p>
						<i class="icon-info-sign"></i> <strong>Note:</strong> This option requires that the <code>&lt;script&gt;</code> tag has an ID of <code>ucfhb-script</code>. 
						If you're using WordPress, <a href="http://codex.wordpress.org/Function_Reference/wp_enqueue_script">click here</a> to 
						read more about using the wp_enqueue_script() function for registering scripts.  The ID value is passed as the first argument 
						of this function.
					</p>


					<h2>Browser Compatibility</h2>
					<p>
						The University Header is compatible with IE7 and greater and any modern browser.
					</p>
				</div>
			</div>
		</div>
	</body>
</html>