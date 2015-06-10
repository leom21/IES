<?php

require_once "webserviceConfig.php";

$appData = file_get_contents("php://input");
$json = json_decode($appData);
$dataA = Array();

foreach ($json->data as $dKey => $dValue) {
    $dataA[$dKey] = $dValue;
}

@$act = $json->act;

class dashboardApi {
    public function getAction($act, $data) {
        if (!empty($data)) {
            $this->$act($data);
        } else {
            $this->$act();
        }
    }

    private function getStock($data) {
        global $iesConn;

        $id = $data["id"];
        $history = mysqli_query($iesConn, "SELECT searchHistory FROM iesusers WHERE id='$id'");
    }

    private function getHistory($data) {
        global $iesConn;

        $id = $data["id"];
        $history = mysqli_query($iesConn, "SELECT searchHistory FROM iesusers WHERE id='$id'");
        $r = mysqli_fetch_array($history);
        echo json_encode($r[0]);
    }

    private function newHistory($data) {
        global $iesConn;
        $id = $data["id"];
        $wl = $data["q"];

        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET searchHistory='$wl' WHERE id='$id'");
        echo $wl;
    }

    private function optWatchH($data) {
        global $iesConn;
        $id = $data["id"];
        $ow = $data["oW"];

        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET optionsWatch='$ow' WHERE id='$id'");
        echo $ow;
    }

    private function clickHistory($data) {
        global $iesConn;
        $id = $data["id"];
        $clicks = $data["ch"];
        print $clicks;

        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET clickHistory='$clicks' WHERE id='$id'");
    }

    private function addToWL($data) {
        global $iesConn;
        $id = $data["id"];
        $wl = $data["wl"];

        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET watchlist='$wl' WHERE id='$id'");
        echo $wl;
    }

    private function removeWL($data) {
        global $iesConn;
        $id = $data["id"];
        $wl = $data["wl"];

        $removeWL = mysqli_query($iesConn, "UPDATE iesusers SET watchlist='$wl' WHERE id='$id'");
        echo $wl;
    }

    private function takePosition($data) {
        global $iesConn;
        $id = $data["id"];
        $pos = json_encode($data["pos"]);

        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET positions='$pos' WHERE id='$id'");
        echo $pos;
    }

    private function userLogin($data) {
        global $iesConn;

        $username = $data["username"];
        $pwd = $data["password"];
        $userData = Array();

        $key = "@00xLzE210";
        $encPWD = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $pwd, MCRYPT_MODE_CBC, md5(md5($key))));

        $checkUser = mysqli_query($iesConn, "SELECT * FROM iesusers WHERE username='$username'");
        $n = mysqli_num_rows($checkUser);
        if ($n === 0) {
            echo "NO_USER";
        } else {
            while ($r = mysqli_fetch_assoc($checkUser)) {
                if ($encPWD == $r["password"]) {
                    if ($r["blocked"] == 0) {
                        $userData["id"] = $r["id"];
                        $userData["username"] = $r["username"];
                        $userData["searchHistory"] = $r["searchHistory"];
                        $userData["clickHistory"] = $r["clickHistory"];
                        $userData["positions"] = $r["positions"];
                        $userData["watchlist"] = $r["watchlist"];
                        $userData["optionsWatch"] = $r["optionsWatch"];
                    } else {
                        echo "BLOCKED";
                    }
                } else {
                    echo "WRONG_PWD";
                }
            }
        }
        if (!empty($userData)) {

            function get_client_ip() {
                $ipaddress = '';
                if (getenv('HTTP_CLIENT_IP'))
                    $ipaddress = getenv('HTTP_CLIENT_IP');
                else if (getenv('HTTP_X_FORWARDED_FOR'))
                    $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
                else if (getenv('HTTP_X_FORWARDED'))
                    $ipaddress = getenv('HTTP_X_FORWARDED');
                else if (getenv('HTTP_FORWARDED_FOR'))
                    $ipaddress = getenv('HTTP_FORWARDED_FOR');
                else if (getenv('HTTP_FORWARDED'))
                    $ipaddress = getenv('HTTP_FORWARDED');
                else if (getenv('REMOTE_ADDR'))
                    $ipaddress = getenv('REMOTE_ADDR');
                else
                    $ipaddress = 'UNKNOWN';
                return $ipaddress;
            }

            $ip = get_client_ip();
            $id = $userData["id"];
            $ips = mysqli_query($iesConn, "SELECT ips FROM iesusers WHERE id='$id'");

            while ($r = mysqli_fetch_assoc($ips)) {
                if (empty($r["ips"])) {
                    $history = mysqli_query($iesConn, "UPDATE iesusers SET ips='$ip' WHERE id='$id'");
                } elseif (strripos($r["ips"], $ip) == false) {
                    $history = mysqli_query($iesConn, "UPDATE iesusers SET ips=CONCAT(ips,',$ip') WHERE id='$id'");
                }
            }
            echo json_encode($userData);
        }
    }

}

$dashboardApi = new dashboardApi;
$dashboardApi->getAction($act, $dataA);
