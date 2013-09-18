<?php
header('Content-Type: application/javascript');
$query = urlencode(strip_tags($_GET['search']));
echo 'ucfhbSetJsonp(\''.file_get_contents('http://search.smca.ucf.edu/service.php?limit=3&search='.$query).'\');';
?>