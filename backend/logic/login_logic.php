<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class LoginLogic {
    public function validate(string $identifier, string $password): true|array {
        $errors = [];

        if (empty($identifier)) {
            $errors["identifier"] = "Please enter your username or email.";
        }

        if (empty($password)) {
            $errors["password"] = "Please enter your password.";
        } elseif (strlen($password) < 8) {
            $errors["password"] = "Password must be at least 8 characters long.";
        }

        return empty($errors) ? true : $errors;
    }

    public function login(array $data, $conn): array {
        $identifier = trim($data["identifier"] ?? "");
        $password = trim($data["password"] ?? "");

        $validation = $this->validate($identifier, $password);
        if ($validation !== true) {
            return $validation;
        }

        $user = $this->attemptLogin($identifier, $password, $conn);

        if (isset($user["id"])) {
            $_SESSION["user"] = [
                "id" => $user["id"],
                "username" => $user["username"],
                "role" => $user["role"]
            ];
            return $user;
        }

        // Feldspezifisch zurückgeben
        if ($user === "wrong_password") {
            return ["password" => "Incorrect password."];
        }

        return ["identifier" => "Username or email not found."];
    }

    public function attemptLogin(string $identifier, string $password, $conn): array|string {
        $sql = "SELECT id, username, password, role FROM users WHERE username = ? OR email = ? LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $identifier, $identifier);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        if ($row = mysqli_fetch_assoc($result)) {
            if (password_verify($password, $row["password"])) {
                return $row;
            } else {
                return "wrong_password";
            }
        }

        return false;
    }

    public function saveRememberToken(int $userId, string $token, $conn): void {
        $sql = "UPDATE users SET remember_token = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "si", $token, $userId);
        mysqli_stmt_execute($stmt);
    }

    public function loginWithToken(string $token, $conn): array|false {
        $sql = "SELECT id, username, role FROM users WHERE remember_token = ? LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $token);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        return mysqli_fetch_assoc($result) ?: false;
    }
}
