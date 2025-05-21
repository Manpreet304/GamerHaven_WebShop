<?php
declare(strict_types=1);

class AccountLogic {
    private mysqli $conn;

    // Konstruktor speichert die MySQLi-Datenbankverbindung
    public function __construct(mysqli $conn) {
        $this->conn = $conn;
    }

    // Account-Daten aktualisieren (nur nach erfolgreicher Passwortprüfung)
    public function updateAccount(int $userId, array $data): array {
        // Überprüfen, ob das aktuelle Passwort korrekt ist
        if (empty($data['password']) || !$this->verifyPassword($userId, $data['password'])) {
            return [401, null, 'Current password is incorrect'];
        }

        // Überprüfen, ob der neue Benutzername bereits von einem anderen Benutzer verwendet wird
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $stmt->bind_param("si", $data["username"], $userId);
        $stmt->execute();
        if ($stmt->get_result()->fetch_assoc()) {
            return [409, null, 'Username is already taken'];
        }

        // Überprüfen, ob die neue E-Mail-Adresse bereits vergeben ist
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->bind_param("si", $data["email"], $userId);
        $stmt->execute();
        if ($stmt->get_result()->fetch_assoc()) {
            return [409, null, 'Email is already in use'];
        }

        // Stammdaten des Benutzers aktualisieren
        $stmt = $this->conn->prepare("
            UPDATE users
            SET username = ?, firstname = ?, lastname = ?, email = ?, address = ?, zip_code = ?, city = ?, country = ?
            WHERE id = ?
        ");
        if (!$stmt) return [500, null, 'DB Error: Prepare failed'];

        // Parameter binden und Update ausführen
        $stmt->bind_param(
            "ssssssssi",
            $data["username"],
            $data["first_name"],
            $data["last_name"],
            $data["email"],
            $data["address"],
            $data["zip_code"],
            $data["city"],
            $data["country"],
            $userId
        );

        if ($stmt->execute()) {
            // Session-Daten aktualisieren (Username)
            $_SESSION['user']['username'] = $data['username'];
            return [200, true, 'Account updated'];
        }

        return [500, false, 'Account update failed'];
    }

    // Passwort ändern mit vorheriger Validierung
    public function changePassword(int $userId, array $data): array {
        // Aktuelles Passwort aus DB holen
        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
        if (!$stmt) return [500, null, 'DB Error'];

        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        // Überprüfung des alten Passworts
        if (!$row || !password_verify($data["old_password"] ?? '', $row["password"])) {
            return [400, false, 'Current password is incorrect.'];
        }

        $new     = $data["new_password"] ?? '';
        $confirm = $data["confirm_password"] ?? '';
        $oldHash = $row["password"];

        // Validierungen für das neue Passwort
        if ($new !== $confirm) return [400, false, 'Passwords do not match.'];
        if (strlen($new) < 8) return [400, false, 'Password must be at least 8 characters.'];
        if (!preg_match('/[a-z]/', $new)) return [400, false, 'Password must contain at least one lowercase letter.'];
        if (!preg_match('/[A-Z]/', $new)) return [400, false, 'Password must contain at least one uppercase letter.'];
        if (!preg_match('/[0-9]/', $new)) return [400, false, 'Password must contain at least one number.'];
        if (password_verify($new, $oldHash)) return [400, false, 'New password must be different from current password.'];

        // Neues Passwort hashen und speichern
        $newHash = password_hash($new, PASSWORD_DEFAULT);
        $update = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        if (!$update) return [500, null, 'DB Error'];

        $update->bind_param("si", $newHash, $userId);
        return $update->execute()
            ? [200, true, 'Password changed']
            : [500, false, 'Failed to change password'];
    }

    // Neue Zahlungsmethode zur Datenbank hinzufügen
    public function addPaymentMethod(int $userId, array $data): array {
        $stmt = $this->conn->prepare("
            INSERT INTO payments (user_id, method, card_number, csv, paypal_email, paypal_username, iban, bic, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        if (!$stmt) return [500, false, 'DB Error'];

        // Zahlungsdaten vorbereiten (abhängig von Methode)
        $method         = $data['method']           ?? '';
        $cardNumber     = $data['card_number']      ?? '';
        $csv            = $data['csv']              ?? '';
        $paypalEmail    = $data['paypal_email']     ?? '';
        $paypalUsername = $data['paypal_username']  ?? '';
        $iban           = $data['iban']             ?? '';
        $bic            = $data['bic']              ?? '';

        // Daten binden und speichern
        $stmt->bind_param(
            "isssssss",
            $userId,
            $method,
            $cardNumber,
            $csv,
            $paypalEmail,
            $paypalUsername,
            $iban,
            $bic
        );

        return $stmt->execute()
            ? [200, true, 'Payment method added']
            : [500, false, 'Failed to add payment method'];
    }

    // Prüft, ob das übergebene Passwort mit dem gespeicherten Passwort übereinstimmt
    private function verifyPassword(int $userId, string $password): bool {
        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
        if (!$stmt) return false;

        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();

        return $row && password_verify($password, $row["password"]);
    }
}
