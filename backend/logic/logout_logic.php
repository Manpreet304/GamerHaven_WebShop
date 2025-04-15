<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class LogoutLogic {
    public function logout($conn): void {
        if (isset($_SESSION["user"]["id"])) {
            $userId = $_SESSION["user"]["id"];

            // Remember-Token in DB entfernen
            $stmt = $conn->prepare("UPDATE users SET remember_token = NULL WHERE id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
        }

        // Cookie löschen
        if (isset($_COOKIE["remember_token"])) {
            setcookie("remember_token", "", time() - 3600, "/");
        }

        // Session beenden
        $_SESSION = [];
        session_unset();
        session_destroy();
    }
}