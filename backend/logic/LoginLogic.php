<?php
class LoginLogic {
    public function login(array $data, $conn): array {
        $identifier = trim($data["identifier"] ?? "");
        $password   = trim($data["password"]   ?? "");

        if (!$identifier || !$password) {
            return ["identifier" => "Please fill in all fields."];
        }

        // is_active mit auslesen
        $stmt = $conn->prepare("
            SELECT id, username, password, role, is_active
            FROM users
            WHERE username = ? OR email = ?
        ");
        $stmt->bind_param("ss", $identifier, $identifier);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!$user) {
            return ["identifier" => "User not found."];
        }

        // erst prüfen, ob der Account aktiv ist
        if ((int)$user["is_active"] !== 1) {
            return ["identifier" => "Account is deactivated. Please contact support."];
        }

        // dann Passwort prüfen
        if (!password_verify($password, $user["password"])) {
            return ["password" => "Incorrect password."];
        }

        // alles gut: remove password before returning
        unset($user["password"], $user["is_active"]);
        return $user;
    }

    public function saveRememberToken(int $userId, string $token, $conn): void {
        $stmt = $conn->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
        $stmt->bind_param("si", $token, $userId);
        $stmt->execute();
    }

    public function loginWithToken(string $token, $conn): array|false {
        $stmt = $conn->prepare("
            SELECT id, username, role, is_active
            FROM users
            WHERE remember_token = ?
        ");
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if (!$user || (int)$user["is_active"] !== 1) {
            return false;
        }
        unset($user["is_active"]);
        return $user;
    }
}
