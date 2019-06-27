<?php
header('Content-Type: application/javascript');
$query = urlencode(strip_tags($_GET['search']));

/**
 * Given a URL, returns the contents of that location as a string.
 *
 * @since 2.1.15
 * @param string $url URL to request + return data from
 * @param array $curl_args Custom arguments to pass to cURL request
 * @return mixed External contents as a string, or false on failure
 */
function fetch_external_contents( $url, $curl_args=array() ) {
	$curl_defaults = array(
		CURLOPT_RETURNTRANSFER => true, // actually return the external contents instead of a success/failure boolean
		CURLOPT_FOLLOWLOCATION => true, // follow redirects
		CURLOPT_CONNECTTIMEOUT => 15, // set a timeout
	);

	$curl_args = ( empty( $curl_args ) ) ? $curl_defaults : array_merge( $curl_defaults, $curl_args );

	$ch        = curl_init( $url );
	curl_setopt_array( $ch, $curl_args );
	$retval    = curl_exec( $ch );
	$http_code = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	$error     = curl_errno( $ch );
	curl_close( $ch );

	if ( $error > 0 || $http_code >= 400 ) {
		$retval = false;
	}

	return $retval;
}

echo 'ucfhbSetJsonp(\''.str_replace("'", "&#39;", fetch_external_contents('@!@SEARCH_SERVICE@!@'.$query)).'\');';
?>
