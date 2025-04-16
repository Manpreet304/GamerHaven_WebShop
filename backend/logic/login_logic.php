<?php
class LoginLogic {
    public function login(array $data, $conn): array {
        $identifier = trim($data["identifier"] ?? "");
        $password = trim($data["password"] ?? "");

        if (!$identifier || !$password) {
            return ["identifier" => "Please fill in all fields."];
        }

        $stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE username = ? OR email = ?");
        $stmt->bind_param("ss", $identifier, $identifier);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($user = $result->fetch_assoc()) {
            if (password_verify($password, $user["password"])) {
                return $user;
            } else {
                return ["password" => "Incorrect password."];
            }
        }

        return ["identifier" => "User not found."];
    }

    public function saveRememberToken(int $userId, string $token, $conn): void {
        $stmt = $conn->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
        $stmt->bind_param("si", $token, $userId);
        $stmt->execute();
    }

    public function loginWithToken(string $token, $conn): array|false {
        $stmt = $conn->prepare("SELECT id, username, role FROM users WHERE remember_token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc() ?: false;
    }
}
