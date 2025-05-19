<?php
// logic/LoginLogic.php

class LoginLogic {
  // Login mit Passwort oder Token, optional mit "Remember Me"
  public function login(array $data, bool $remember, mysqli $conn): array {
    $identifier = trim($data["identifier"] ?? "");
    $password   = trim($data["password"] ?? "");

    if (!$identifier || !$password) {
      return [400, null, "Please fill in all fields."];
    }

    // Nutzer abrufen per Username oder Email
    $stmt = $conn->prepare("SELECT id, username, password, role, is_active
                            FROM users
                            WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $identifier, $identifier);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if (!$user) return [404, null, "User not found."];
    if ($user["is_active"] !== 'true') return [403, null, "Account is deactivated."];
    if (!password_verify($password, $user["password"])) return [401, null, "Incorrect password."];

    // Session setzen
    unset($user["password"], $user["is_active"]);
    $_SESSION["user"] = $user;

    // "Remember Me" Cookie setzen
    if ($remember) {
      $token = bin2hex(random_bytes(16));
      setcookie("remember_token", $token, time() + 60 * 60 * 24 * 30, "/");
      $this->saveRememberToken($user["id"], $token, $conn);
    }

    return [200, ["user" => $user], "Login successful"];
  }

  // Token in DB speichern
  public function saveRememberToken(int $userId, string $token, mysqli $conn): void {
    $stmt = $conn->prepare("UPDATE users SET remember_token = ? WHERE id = ?");
    $stmt->bind_param("si", $token, $userId);
    $stmt->execute();
  }

  // Login per Cookie-Token
  public function loginWithToken(string $token, mysqli $conn): array {
    $stmt = $conn->prepare("SELECT id, username, role, is_active
                            FROM users
                            WHERE remember_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    if (!$user || $user["is_active"] !== 'true') {
      return [403, null, "Invalid token"];
    }

    unset($user["is_active"]);
    $_SESSION["user"] = $user;
    return [200, $user, "Token login successful"];
  }
}