<?php

ini_set('display_errors', 1);

$uri = explode(".", ltrim($_SERVER["HTTP_HOST"], "/"));
if ($uri[0] == "local") {
    $server = "localhost";
    $un = "root";
    $pwd = "root";
    $db = "iesdb";
} else {
    $server = "62.219.78.224";
    $un = "6450_mtdb";
    $pwd = "00mt00";
    $db = "6450_mtdb";
}
$iesConn = mysqli_connect($server, $un, $pwd, $db);
mysqli_set_charset($iesConn, "utf8");

if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
}


