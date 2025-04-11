<?php

// Überprüfe und starte die Sitzung, wenn sie noch nicht aktiv ist
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

class LogoutLogic {
    public function logout($conn): void {
        // Falls die Sitzung noch aktiv ist, führe Logout aus
        if (isset($_SESSION["user"]["id"])) {
            $userId = $_SESSION["user"]["id"];

            // Entferne das remember_token aus der Datenbank
            $stmt = $conn->prepare("UPDATE users SET remember_token = NULL WHERE id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
        }

        // Lösche das remember_token Cookie
        if (isset($_COOKIE["remember_token"])) {
            setcookie("remember_token", "", time() - 3600, "/");
        }

        // Sitzung beenden
        $_SESSION = [];
        session_unset();
        session_destroy();
    }
}

?>
