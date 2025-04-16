<?php
class LogoutLogic {
    public function logout($conn): void {
        if (isset($_SESSION["user"]["id"])) {
            $stmt = $conn->prepare("UPDATE users SET remember_token = NULL WHERE id = ?");
            $stmt->bind_param("i", $_SESSION["user"]["id"]);
            $stmt->execute();
        }

        if (isset($_COOKIE["remember_token"])) {
            setcookie("remember_token", "", time() - 3600, "/");
        }

        $_SESSION = [];
        session_unset();
        session_destroy();
    }
}
