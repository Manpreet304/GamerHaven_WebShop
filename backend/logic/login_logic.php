<?php

class LoginLogic {
    public function validate(string $identifier, string $password): true|string {
        if (empty($identifier)) {
            return "Please enter your username or email.";
        }

        if (empty($password)) {
            return "Please enter your password.";
        }

        if (strlen($password) < 6) {
            return "Password must be at least 6 characters long.";
        }

        return true;
    }

    public function login(array $data, $conn): array|string {
        $identifier = trim($data["identifier"] ?? "");
        $password = trim($data["password"] ?? "");

        $validation = $this->validate($identifier, $password);
        if ($validation !== true) {
            return $validation;
        }

        $user = $this->attemptLogin($identifier, $password, $conn);
        if (!$user) {
            return "Invalid identifier or password.";
        }

        $_SESSION["user"] = [
            "id" => $user["id"],
            "username" => $user["username"],
            "role" => $user["role"]
        ];

        return $user;
    }

    public function attemptLogin(string $identifier, string $password, $conn): array|false {
        $sql = "SELECT id, username, password, role FROM users WHERE username = ? OR email = ? LIMIT 1";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "ss", $identifier, $identifier);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        if ($row = mysqli_fetch_assoc($result)) {
            if (password_verify($password, $row["password"])) {
                return $row;
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
