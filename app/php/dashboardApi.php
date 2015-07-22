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
        $symbol = $data["symbol"];

        $searchStr = '{"symbol":"' . $symbol . '", "date":' . time() . '}';
        $history = mysqli_query($iesConn, "UPDATE iesusers SET pastSearch=CONCAT(pastSearch,',$searchStr') WHERE id='$id'");
        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET searchHistory='$wl' WHERE id='$id'");
        echo $wl;
    }

//
//    private function optWatchH($data) {
//        global $iesConn;
//        $id = $data["id"];
//        $ow = $data["oW"];
//
//        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET optionsWatch='$ow' WHERE id='$id'");
//        echo $ow;
//    }

    private function clickHistoryUpdate($data) {
        global $iesConn;
        $time = time();
        $id = $data["id"];
        $clicks = $data["ch"];
        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET clickHistory='$clicks' WHERE id='$id'");
//        $updatedValues = Array();
//
//        $clickH = mysqli_query($iesConn, "SELECT clickHistory, id FROM iesusers");
//        while ($row = mysqli_fetch_assoc($clickH)) {
//            if (!empty($row["clickHistory"])) {
//                $userId = $row["id"];
//                $clickHistory = Array();
//                $x = $row["clickHistory"];
//                $x = (string) $x;
//                $x = explode(",", $x);
//                $x = str_replace("{", "", $x);
//                $x = str_replace("}", "", $x);
//                foreach ($x as $stock) {
//                    $stock = explode(":", $stock);
//                    $symbol = str_replace('"', "", $stock[0]);
//                    $num = str_replace('"', "", $stock[1]);
//                    $searchArray = Array("clickNum" => $num, "date" => $time);
//                    $symbolArray = Array($symbol => $searchArray);
//                    $clickHistory[] = $symbolArray;
//                }
//                $clickHistory = json_encode($clickHistory);
//                $update = mysqli_query($iesConn, "UPDATE iesusers SET clickHistory='$clickHistory' WHERE id='$userId'");
//            }
//        }
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
        $symbol = $data["symbol"];
        $date = $data["date"];

        $clickH = mysqli_query($iesConn, "UPDATE iesusers SET watchlist='$wl' WHERE id='$id'");

        $prevWL = mysqli_query($iesConn, "SELECT prevWL from iesusers WHERE id='$id'");
        $row = mysqli_fetch_array($prevWL);
        $json = json_decode($row["prevWL"], true);
        $object = array("symbol" => $symbol, "addDate" => $date, "removeDate" => null);
        array_push($json["prevWL"], $object);
        $final = json_encode($json);
        $update = mysqli_query($iesConn, "UPDATE iesusers SET prevWL='$final' WHERE id='$id'");

        echo $wl;
    }

    private function removeWL($data) {
        global $iesConn;
        $id = $data["id"];
        $wl = $data["wl"];
        $symbol = $data["symbol"];
        $date = $data["date"];

        $prevWL = mysqli_query($iesConn, "SELECT prevWL from iesusers WHERE id='$id'");
        $row = mysqli_fetch_array($prevWL);
        $json = json_decode($row["prevWL"], true);
        foreach ($json["prevWL"] as &$aSymbol) {
            if ($aSymbol["symbol"] == $symbol && $aSymbol["removeDate"] == null) {
                $aSymbol["removeDate"] = $date;
            }
        }
        $final = json_encode($json);
        $update = mysqli_query($iesConn, "UPDATE iesusers SET prevWL='$final' WHERE id='$id'");

        $removeWL = mysqli_query($iesConn, "UPDATE iesusers SET watchlist='$wl' WHERE id='$id'");
        echo $wl;
    }

    private function takePosition($data) {
        global $iesConn;
        $id = $data["id"];
        $pos = json_encode($data["pos"]);

        if ($data["removed"] == true) {
            $prevPositions = mysqli_query($iesConn, "SELECT prevPositions from iesusers WHERE id='$id'");
            $row = mysqli_fetch_array($prevPositions);
            $json = json_decode($row["prevPositions"], true);
            $removedPosition = (array($data["removedPosition"][0]));
            array_push($json["prevPositions"], $removedPosition[0]);
            $final = json_encode($json);
            $update = mysqli_query($iesConn, "UPDATE iesusers SET prevPositions='$final' WHERE id='$id'");
        }

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

//                if (getenv('HTTP_CLIENT_IP'))
//                    $ipaddress = getenv('HTTP_CLIENT_IP');
//                else if (getenv('HTTP_X_FORWARDED_FOR'))
//                    $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
//                else if (getenv('HTTP_X_FORWARDED'))
//                    $ipaddress = getenv('HTTP_X_FORWARDED');
//                else if (getenv('HTTP_FORWARDED_FOR'))
//                    $ipaddress = getenv('HTTP_FORWARDED_FOR');
//                else if (getenv('HTTP_FORWARDED'))
//                    $ipaddress = getenv('HTTP_FORWARDED');
//                else if (getenv('REMOTE_ADDR'))
//                    $ipaddress = getenv('REMOTE_ADDR');
//                else
//                    $ipaddress = 'UNKNOWN';
//                return $ipaddress;
                if (getenv('REMOTE_ADDR'))
                    $ipaddress = getenv('REMOTE_ADDR');
                else if (getenv('HTTP_X_FORWARDED_FOR'))
                    $ipaddress = getenv('HTTP_X_FORWARDED_FOR');
                else if (getenv('HTTP_X_FORWARDED'))
                    $ipaddress = getenv('HTTP_X_FORWARDED');
                else if (getenv('HTTP_FORWARDED_FOR'))
                    $ipaddress = getenv('HTTP_FORWARDED_FOR');
                else if (getenv('HTTP_FORWARDED'))
                    $ipaddress = getenv('HTTP_FORWARDED');
                else if (getenv('HTTP_CLIENT_IP'))
                    $ipaddress = getenv('HTTP_CLIENT_IP');
                else
                    $ipaddress = 'UNKNOWN';
                return $ipaddress;
            }

            $id = $userData["id"];
            $counter = mysqli_query($iesConn, "UPDATE iesusers SET loginCounter = loginCounter + 1 WHERE id = '$id'");

            $ip = (string) get_client_ip();
            $ips = mysqli_query($iesConn, "SELECT ips FROM iesusers WHERE id='$id'");

            while ($r = mysqli_fetch_assoc($ips)) {
                $ipsDb = $r["ips"];
                $ipsToStr = (string) $ipsDb;
                if (empty($r["ips"])) {
                    $history = mysqli_query($iesConn, "UPDATE iesusers SET ips='$ip' WHERE id='$id'");
                } else {
                    if (is_nan(strpos($ipsDb, $ip))) {
                        $history = mysqli_query($iesConn, "UPDATE iesusers SET ips=CONCAT(ips,',$ip') WHERE id='$id'");
                    }
                }
            }

            $timedate = time();
            $lastLogin = mysqli_query($iesConn, "UPDATE iesusers SET lastLogin='$timedate' WHERE id='$id'");

            echo json_encode($userData);
        }
    }

}

$dashboardApi = new dashboardApi;
$dashboardApi->getAction($act, $dataA);
