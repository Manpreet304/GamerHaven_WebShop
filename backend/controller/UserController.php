<?php
require_once("../logic/RegisterLogic.php");
require_once("../logic/LogicLogic.php");
require_once("../logic/LogoutLogic.php");
require_once("../models/UserModel.php");

class UserController {
    public function register(array $data): array {
        global $conn;

        $user = new User($data);
        $registerLogic = new RegisterLogic();

        $validation = $registerLogic->validate($user, $data["password2"] ?? '', $conn);
        if ($validation !== true) {
            return ["status" => 400, "body" => ["errors" => $validation]];
        }

        $saved = $registerLogic->save($user, $conn);
        return [
            "status" => $saved ? 200 : 500,
            "body" => ["success" => $saved]
        ];
    }

    public function login(array $data, bool $remember): array {
        global $conn;
        $loginLogic = new LoginLogic();
        $result = $loginLogic->login($data, $conn);

        if (isset($result["id"])) {
            if ($remember) {
                $token = bin2hex(random_bytes(16));
                setcookie("remember_token", $token, time() + 60 * 60 * 24 * 30, "/");
                $loginLogic->saveRememberToken($result["id"], $token, $conn);
            }
            $_SESSION["user"] = $result;

            return ["status" => 200, "body" => ["success" => true]];
        }

        return ["status" => 400, "body" => ["errors" => $result]];
    }

    public function logout(): array {
        global $conn;
        $logoutLogic = new LogoutLogic();
        $logoutLogic->logout($conn);

        return [
            "status" => 200,
            "body" => ["success" => true]
        ];
    }

    public function removePayment(int $paymentId, $conn): array {
        require_once("../logic/account_logic.php");
        $logic = new AccountLogic();
        $success = $logic->removePaymentMethod($paymentId, $conn);
        return [
            "status" => $success ? 200 : 500,
            "body" => ["success" => $success]
        ];
    }
}
