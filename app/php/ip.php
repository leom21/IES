<?php
//
////
//function get_client_ip() {
//    $ipaddress = '';
//    if (getenv('HTTP_CLIENT_IP'))
//        $ipaddress = getenv('HTTP_CLIENT_IP');
//    else if (getenv('HTTP_X_FORWARDED_FOR'))
//        $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
//    else if (getenv('HTTP_X_FORWARDED'))
//        $ipaddress = getenv('HTTP_X_FORWARDED');
//    else if (getenv('HTTP_FORWARDED_FOR'))
//        $ipaddress = getenv('HTTP_FORWARDED_FOR');
//    else if (getenv('HTTP_FORWARDED'))
//        $ipaddress = getenv('HTTP_FORWARDED');
//    else if (getenv('REMOTE_ADDR'))
//        $ipaddress = getenv('REMOTE_ADDR');
//    else
//        $ipaddress = 'UNKNOWN';
//    return $ipaddress;
//}
//
//echo get_client_ip();
//
//echo "<pre>" . print_r($_SERVER, true) . "</pre>";
//
//echo "<pre>" . print_r($_ENV, true) . "</pre>";
//
////if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])){
////   define("USER_IP", $_SERVER['HTTP_X_FORWARDED_FOR']); 
////}
//
//function _ip() {
//    if (preg_match( "/^([d]{1,3}).([d]{1,3}).([d]{1,3}).([d]{1,3})$/", getenv('HTTP_X_FORWARDED_FOR'))) {
//        return getenv('HTTP_X_FORWARDED_FOR');
//    }
//    return getenv('REMOTE_ADDR');
//}
//
//echo _ip();

phpinfo();