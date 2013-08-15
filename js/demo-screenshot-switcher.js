/* Demo screenshot switching */
$('#ucf-logo, #nav-wrapper ul li a, #subnav-wrapper ul li a').click(function(e) {
	var img = $(this).attr('href');
	if (img.substr(0,1) == '#') {
		e.preventDefault();
		$('.screenshot.active').removeClass('active');
		$(img).addClass('active');
	}
});