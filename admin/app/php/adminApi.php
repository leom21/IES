<?php

require_once "webserviceConfig.php";

$appData = file_get_contents("php://input");
$json = json_decode($appData);
$dataA = Array();

if (!empty($json->data)) {
    foreach ($json->data as $dKey => $dValue) {
        $dataA[$dKey] = $dValue;
    }
}

@$act = $json->act;

class adminApi {

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

    private function editUser($data) {
        global $iesConn;
        $id = $data["id"];
        $name = $data["name"];
        $username = $data["username"];
        $password = $data["password"];
        $email = $data["email"];

        $key = "@00xLzE210";
        $encPWD = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $password, MCRYPT_MODE_CBC, md5(md5($key))));

        $updateUser = mysqli_query($iesConn, "UPDATE iesusers SET name='$name', username='$username', password='$encPWD', email='$email'"
                . " WHERE id='$id'");

        self::getAllUsers();
    }

    private function addUser($data) {
        global $iesConn;
        $admin = $data["admin"];
        $name = $data["name"];
        $username = $data["username"];
        $password = $data["password"];
        $email = $data["email"];
        $positions = '{"positions":[]}';

        $key = "@00xLzE210";

        $encPWD = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $password, MCRYPT_MODE_CBC, md5(md5($key))));

        $addUser = mysqli_query($iesConn, "INSERT INTO iesusers (name,username,password,email,admin,positions) " .
                "VALUES('$name','$username','$encPWD','$email','$admin','$positions')");

        self::getAllUsers();
    }

    private function blockUser($data) {
        global $iesConn;
        $id = $data["id"];

        $blockUser = mysqli_query($iesConn, "UPDATE iesusers SET blocked='1'"
                . " WHERE id='$id'");

        self::getAllUsers();
    }

    private function unblockUser($data) {
        global $iesConn;
        $id = $data["id"];

        $blockUser = mysqli_query($iesConn, "UPDATE iesusers SET blocked='0'"
                . " WHERE id='$id'");

        self::getAllUsers();
    }

    private function deleteUser($data) {
        global $iesConn;
        $id = $data["id"];

        $deleteUser = mysqli_query($iesConn, "DELETE FROM iesusers WHERE id='$id'");

        self::getAllUsers();
    }

    private function getAllUsers() {
        global $iesConn;
        $usersArray = Array();
        $key = "@00xLzE210";


        $getAllUsers = mysqli_query($iesConn, "SELECT * FROM iesusers");
        while ($r = mysqli_fetch_assoc($getAllUsers)) {
            $arr = array();
            $decPass = rtrim(mcrypt_decrypt(MCRYPT_RIJNDAEL_256, md5($key), base64_decode($r["password"]), MCRYPT_MODE_CBC, md5(md5($key))), "\0");
            $arr["id"] = $r["id"];
            $arr["name"] = $r["name"];
            $arr["username"] = $r["username"];
            $arr["password"] = $decPass;
            $arr["email"] = $r["email"];
            $arr["blocked"] = $r["blocked"];
            $arr["admin"] = $r["admin"];
            $arr["ips"] = $r["ips"];
            $arr["searchHistory"] = $r["searchHistory"];
            $arr["clickHistory"] = $r["clickHistory"];
            $usersArray[] = $arr;
        }
        print json_encode($usersArray);
    }

    private function adminLogin($data) {
        global $iesConn;

        $username = $data["un"];
        $pwd = $data["pwd"];
        $userData = Array();

        $key = "@00xLzE210";

        $encPWD = base64_encode(mcrypt_encrypt(MCRYPT_RIJNDAEL_256, md5($key), $pwd, MCRYPT_MODE_CBC, md5(md5($key))));

        $checkUser = mysqli_query($iesConn, "SELECT * FROM iesusers WHERE username='$username' AND admin='1'");
        $n = mysqli_num_rows($checkUser);
        if ($n === 0) {
            echo "NO_USER";
        } else {
            while ($r = mysqli_fetch_assoc($checkUser)) {
                if ($pwd == $r["password"]) {
                    $userData["id"] = $r["id"];
                    $userData["username"] = $r["username"];
                    $userData["searchHistory"] = $r["searchHistory"];
                    $userData["clickHistory"] = $r["clickHistory"];
                } else {
                    echo "WRONG_PWD";
                }
            }
        }
        if (!empty($userData)) {
            echo json_encode($userData);
        }
    }

}

$adminApi = new adminApi;
$adminApi->getAction($act, $dataA);
