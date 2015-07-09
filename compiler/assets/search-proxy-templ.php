<?php
header('Content-Type: application/javascript');
$query = urlencode(strip_tags($_GET['search']));
echo 'ucfhbSetJsonp(\''.str_replace("'", "&#39;", file_get_contents('@!@SEARCH_SERVICE@!@'.$query)).'\');';
?>