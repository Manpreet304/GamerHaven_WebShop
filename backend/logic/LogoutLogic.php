<?php
// logic/LogoutLogic.php

class LogoutLogic {
  // Benutzer abmelden: Token entfernen, Cookies löschen, Session beenden
  public function logout(mysqli $conn): array {
    // Token aus DB entfernen
    if (isset($_SESSION["user"]["id"])) {
      $stmt = $conn->prepare("UPDATE users SET remember_token = NULL WHERE id = ?");
      $stmt->bind_param("i", $_SESSION["user"]["id"]);
      $stmt->execute();
    }

    // Cookie löschen
    if (isset($_COOKIE["remember_token"])) {
      setcookie("remember_token", "", time() - 3600, "/");
    }

    // Session zurücksetzen
    $_SESSION = [];
    session_unset();
    session_destroy();

    return [200, ["loggedOut" => true], "Logout successful"];
  }
}