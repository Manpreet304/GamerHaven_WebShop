<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class UserController {
    public function register(array $data): array {
        global $conn;

        $user = new User($data);
        $registerLogic = new RegisterLogic();

        $validation = $registerLogic->validate($user, $data["password2"] ?? '', $conn);
        if ($validation !== true) {
            return [
                "status" => 400,
                "body" => ["errors" => $validation]
            ];
        }

        if ($registerLogic->save($user, $conn)) {
            return [
                "status" => 200,
                "body" => ["success" => true]
            ];
        }

        return [
            "status" => 500,
            "body" => ["errors" => ["general" => "Error saving user."]]
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
}