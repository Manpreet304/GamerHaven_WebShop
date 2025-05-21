<?php
// logic/LoginLogic.php

class LoginLogic {

  // Führt einen Login mit Benutzername/E-Mail und Passwort durch. Optional mit "Remember Me" Funktion.
  public function login(array $data, bool $remember, mysqli $conn): array {
    $identifier = trim($data["identifier"] ?? "");
    $password   = trim($data["password"] ?? "");

    // Überprüfung auf leere Felder
    if (!$identifier || !$password) {
      return [400, null, "Please fill in all fields."];
    }

    // Benutzer anhand von Benutzername oder E-Mail aus der Datenbank laden
    $stmt = $conn->prepare("SELECT id, username, password, role, is_active
                            FROM users
                            WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $identifier, $identifier);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    // Fehlerbehandlung bei nicht gefundenem, deaktiviertem oder ungültigem Benutzer
    if (!$user) return [404, null, "User not found."];
    if ($user["is_active"] !== 'true') return [403, null, "Account is deactivated."];
    if (!password_verify($password, $user["password"])) return [401, null, "Incorrect password."];

    // Erfolgreicher Login: Session setzen und Passwort aus Daten entfernen
    unset($user["password"], $user["is_active"]);
    $_SESSION["user"] = $user;

    // Optional: "Remember Me" Token generieren und im Cookie sowie in der Datenbank speichern
    if ($remember) {
      $token = bin2hex(random_bytes(16));
      setcookie("remember_token", $token, time() + 60 * 60 * 24 * 30, "/");
      $this->saveRememberToken($user["id"], $token, $conn);
    }

    return [200, ["user" => $user], "Login successful"];
  }

  // Speichert den "Remember Me" Token mit Ablaufdatum in der Datenbank
  public function saveRememberToken(int $userId, string $token, mysqli $conn): void {
    $expires = date('Y-m-d H:i:s', time() + 60 * 60 * 24 * 30); // Token ist 30 Tage gültig
    $stmt = $conn->prepare("UPDATE users SET remember_token = ?, remember_token_expires = ? WHERE id = ?");
    $stmt->bind_param("ssi", $token, $expires, $userId);
    $stmt->execute();
  }

  // Führt einen Login basierend auf dem Remember-Token (z. B. aus einem Cookie) durch
  public function loginWithToken(string $token, mysqli $conn): array {
    $stmt = $conn->prepare("SELECT id, username, role, is_active, remember_token_expires
                            FROM users
                            WHERE remember_token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();

    // Tokenprüfung: Benutzer existiert, ist aktiv und das Token ist nicht abgelaufen
    if (
      !$user ||
      $user["is_active"] !== 'true' ||
      !isset($user["remember_token_expires"]) ||
      strtotime($user["remember_token_expires"]) < time()
    ) {
      return [403, null, "Invalid or expired token"];
    }

    // Benutzer in Session speichern und sensible Daten entfernen
    unset($user["is_active"], $user["remember_token_expires"]);
    $_SESSION["user"] = $user;

    return [200, $user, "Token login successful"];
  }
}
