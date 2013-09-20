<?php
header('Content-Type: application/javascript');
$query = urlencode(strip_tags($_GET['search']));
echo 'ucfhbSetJsonp(\''.file_get_contents('@!@SEARCH_SERVICE@!@'.$query).'\');';
?>