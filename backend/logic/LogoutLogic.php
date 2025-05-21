<?php
// logic/LogoutLogic.php

class LogoutLogic {

  // Meldet den Benutzer ab: entfernt Token, löscht Cookie und beendet die Session
  public function logout(mysqli $conn): array {
    // Entfernt Remember-Token und Ablaufdatum aus der Datenbank
    if (isset($_SESSION["user"]["id"])) {
      $stmt = $conn->prepare("UPDATE users SET remember_token = NULL, remember_token_expires = NULL WHERE id = ?");
      $stmt->bind_param("i", $_SESSION["user"]["id"]);
      $stmt->execute();
    }

    // Entfernt das Remember-Me-Cookie aus dem Browser
    if (isset($_COOKIE["remember_token"])) {
      setcookie("remember_token", "", time() - 3600, "/");
      unset($_COOKIE["remember_token"]); // Optional: auch aus dem PHP-Array entfernen
    }

    // Löscht alle Session-Daten und zerstört die Session vollständig
    $_SESSION = [];
    session_unset();
    session_destroy();

    return [200, ["loggedOut" => true], "Logout successful"];
  }
}
