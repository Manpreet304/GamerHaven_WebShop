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
                "body" => ["error" => $validation]
            ];
        }

        if ($registerLogic->save($user, $conn)) {
            return [
                "status" => 200,
                "body" => ["success" => true]
            ];
        } else {
            return [
                "status" => 500,
                "body" => ["error" => "Error saving user: " . mysqli_error($conn)]
            ];
        }
    }

    public function login(array $data, bool $remember): array {
        global $conn;

        $loginLogic = new LoginLogic();
        $result = $loginLogic->login($data, $conn);

        if (is_string($result)) {
            return [
                "status" => 400,
                "body" => ["error" => $result]
            ];
        }

        if ($remember) {
            $token = bin2hex(random_bytes(16));
            setcookie("remember_token", $token, time() + 60 * 60 * 24 * 30, "/");
            $loginLogic->saveRememberToken($result["id"], $token, $conn);
        }

        return [
            "status" => 200,
            "body" => ["success" => true]
        ];
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
?>
