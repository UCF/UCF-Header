<!DOCTYPE html>
<html>
	<head>
		<title>UCF University Header</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta charset="utf-8">
		<link media="all" type="text/css" href="http://www.ucf.edu/wp-content/themes/Main-Site-Theme/static/bootstrap/bootstrap/css/bootstrap.min.css" rel="stylesheet">
		<link media="all" type="text/css" href="http://www.ucf.edu/wp-content/themes/Main-Site-Theme/static/bootstrap/bootstrap/css/bootstrap-responsive.min.css" rel="stylesheet">
		<link media="all" type="text/css" href="http://www.ucf.edu/wp-content/themes/Main-Site-Theme/static/css/webcom-base.css" rel="stylesheet">
		<script type="text/javascript" id="ucfhb-script" src="http://webcom.dev.smca.ucf.edu/UCF-Header/bar/js/university-header.js?use-bootstrap-overrides=1"></script>
		<style type="text/css">
			h1 { padding-top: 20px; }
			h3 { padding-top: 10px; }
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

					<h2>Installation</h2>
					<p>
						To add the University Header to your website, add the following script tag to your document.
					</p>
					<div class="alert alert-info">
						<p>
							<i class="icon-info-sign"></i> <strong>Note:</strong> If you've included the old version of the University Header on your website, your site should display the new bar automatically 
							without needing any modifications.
						</p>
					</div>

					<h3>Standard</h3>
					<pre>&lt;script type="text/javascript" id="ucfhb-script" src="http://universityheader.ucf.edu/bar/js/university-header.js"&gt;&lt;/script&gt;</pre>

					<h3>Minified (recommended)</h3>
					<pre>&lt;script type="text/javascript" id="ucfhb-script" src="http://universityheader.ucf.edu/bar/js/university-header.min.js"&gt;&lt;/script&gt;</pre>

					<hr/>

					<h2>Usage</h2>
					<p>
						Please keep in mind the following when including the University Header on your website:
					</p>
					<ol>
						<li>
							<h3>The University Header should be consistent visually and functionally across all UCF websites.</h3>
							Please do not modify the bar's existing appearance or functionality; this includes modifying graphics/colors associated with the bar, links 
							included within the bar, markup associated with the bar, and the search and autocomplete functionality.
						</li>
						<li>
							<h3>The University Header should always be at the top of each page.</h3>
							Do not place the bar below any other elements on the page.  The bar should always be first.
						</li>
						<li>
							<h3>The University Header should not present any other content beyond its default parameters.</h3>
							The bar should not be given the appearance of an 'attachment' of the default bar on your site, and should not include extra 
							links or graphics beyond what the default bar provides.  
							<em>Your site's navigation should not be displayed as an extension or piece of the University Header.</em>
						</li>
					</ol>

					<hr/>

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
					</p>
					<p>
						Keep in mind that this snippet may require updating in the future to match the bar's script as it is updated and maintained.  Use this 
						snippet only if the performance boost is significant.
					</p>
					<div class="alert alert-warning">
						<p>
							<i class="icon-info-sign"></i> <strong>Note: <em>The University Header must always be the first element
							at the top of the screen.</em></strong>  Do not place the bar below any other elements on your page.
						</p>
					</div>
					<pre>&lt;div id="ucfhb" style="height: 50px; width: 100%; margin: auto; background: #000; position: relative; z-index: 999;"&gt;&lt;/div&gt;</pre>

					<h3>Bootstrap 2.x overrides</h3>
					<p>
						Due to the way that older versions of Bootstrap apply left- and right-hand padding to elements at screen sizes less than 768px wide, 
						a style override is necessary for sites using these versions of Bootstrap.  These overrides can also be used for any other framework 
						that applies 20px of left- and right-hand padding to the <code>&lt;body&gt;</code>.
					</p>
					<pre>&lt;script type="text/javascript" id="ucfhb-script" src="http://universityheader.ucf.edu/bar/js/university-header.js?use-bootstrap-overrides=1"&gt;&lt;/script&gt;</pre>
					<div class="alert alert-info">
						<p>
							<i class="icon-info-sign"></i> <strong>Note:</strong> This option requires that the <code>&lt;script&gt;</code> tag has an ID of <code>ucfhb-script</code>. 
							If you're using WordPress, <a href="http://codex.wordpress.org/Function_Reference/wp_enqueue_script">click here</a> to 
							read more about using the wp_enqueue_script() function for registering scripts.  The ID value is passed as the first argument 
							of this function.
						</p>
					</div>

					<hr/>

					<h2>Browser Compatibility</h2>

					<h3>Desktop</h3>
					<p>
						The University Header is compatible with IE7 and greater and works in any other modern browser.<br/>
						Note that some features, such as CSS3 animations on the UCF Login toggle, are not available on older browsers.  Responsiveness is 
						nonfunctional in IE8 and lower due to lack of support for CSS media queries; functionality can be added with additional libraries such as 
						<a href="https://github.com/scottjehl/Respond">respond.js</a> if necessary.  The UCF Header has not been tested with these libraries 
						and support with these libraries is not guaranteed.
					</p>

					<h3>Mobile</h3>
					<p>
						The University Header has been tested in iOS 6.0+ and stock Android browser emulators running Android v1.5+, as well as the latest 
						version of Opera Mobile.
					</p>

					<br/><br/>
				</div>
			</div>
		</div>
	</body>
</html>