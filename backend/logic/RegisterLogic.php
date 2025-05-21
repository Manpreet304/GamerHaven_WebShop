<?php
class RegisterLogic {

    // Registrierung eines neuen Benutzers: validiert Eingaben und speichert Daten
    public function register(User $user, string $password2, mysqli $conn): array {
        $errors = $this->validate($user, $password2, $conn);
        if (!empty($errors)) {
            return [400, ["errors" => $errors], "Validation failed"];
        }

        return $this->save($user, $conn);
    }

    // Validiert Passwort, E-Mail und prüft auf doppelte Benutzernamen oder E-Mail-Adressen
    public function validate(User $user, string $password2, mysqli $conn): array {
        $errors = [];

        // Passwort-Wiederholung prüfen
        if ($user->password !== $password2) {
            $errors["password2"] = "Passwords do not match.";
        }

        // Passwort-Länge prüfen
        if (strlen($user->password) < 8) {
            $errors["password"] = "Password too short.";
        }

        // Passwort-Komplexität prüfen (Groß-, Kleinbuchstaben, Zahl)
        if (!preg_match('/[A-Z]/', $user->password) ||
            !preg_match('/[a-z]/', $user->password) ||
            !preg_match('/[0-9]/', $user->password)) {
            $errors["password"] = "Password must contain uppercase, lowercase, and number.";
        }

        // Gültige E-Mail prüfen
        if (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            $errors["email"] = "Invalid email.";
        }

        // Benutzername darf nicht doppelt sein
        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $user->username);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $errors["username"] = "Username taken.";
        }

        // E-Mail darf nicht doppelt sein
        $stmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->bind_param("s", $user->email);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $errors["email"] = "Email already registered.";
        }

        return $errors;
    }

    // Speichert den Benutzer und seine Zahlungsmethode in der Datenbank (Transaktional)
    public function save(User $user, mysqli $conn): array {
        $conn->begin_transaction();

        try {
            // Benutzer speichern
            $stmt = $conn->prepare("INSERT INTO users (salutation, firstname, lastname, address, zip_code, city, email, username, password, country, created_at, role)
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'user')");

            $hash = password_hash($user->password, PASSWORD_DEFAULT);
            $stmt->bind_param("ssssssssss",
                $user->salutation,
                $user->first_name,
                $user->last_name,
                $user->address,
                $user->zip,
                $user->city,
                $user->email,
                $user->username,
                $hash,
                $user->country
            );
            $stmt->execute();
            $userId = $conn->insert_id;

            // Zahlungsmethode speichern
            $stmt2 = $conn->prepare("INSERT INTO payments (user_id, method, card_number, csv, paypal_email, paypal_username, iban, bic, created_at)
                                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt2->bind_param("isssssss",
                $userId,
                $user->payment_method,
                $user->card_number,
                $user->csv,
                $user->paypal_email,
                $user->paypal_username,
                $user->iban,
                $user->bic
            );
            $stmt2->execute();

            // Transaktion abschließen
            $conn->commit();
            return [200, ["id" => $userId], "Registration successful"];

        } catch (Exception $e) {
            // Bei Fehler alles zurückrollen
            $conn->rollback();
            return [500, null, "Registration failed"];
        }
    }
}
