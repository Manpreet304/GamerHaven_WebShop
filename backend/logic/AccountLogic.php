<?php
declare(strict_types=1);

class AccountLogic {
    public function updateUser(int $userId, array $data, $conn): bool {
        $sql = "UPDATE users
                SET firstname = ?, lastname = ?, email = ?, address = ?, zip_code = ?, city = ?, country = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("updateUser prepare failed: " . $conn->error);
            return false;
        }
        $stmt->bind_param(
            "sssssssi",
            $data["firstname"],
            $data["lastname"],
            $data["email"],
            $data["address"],
            $data["zip_code"],
            $data["city"],
            $data["country"],
            $userId
        );
        return $stmt->execute();
    }

    public function verifyPassword(int $userId, string $password, $conn): bool {
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        if ($stmt === false) {
            error_log("verifyPassword prepare failed: " . $conn->error);
            return false;
        }
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        return $row && password_verify($password, $row["password"]);
    }

    public function changePassword(int $userId, array $data, mysqli $conn): bool|string {
        // 1) Aktuelles Passwort holen und prüfen
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        if ($stmt === false) {
            error_log("changePassword SELECT prepare failed: " . $conn->error);
            return "Internal error";
        }
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if (!$row || !password_verify($data["old_password"], $row["password"])) {
            return "Current password is incorrect.";
        }
    
        $new    = $data["new_password"] ?? '';
        $confirm= $data["confirm_password"] ?? '';
    
        // 2) Neue Passwörter stimmen überein?
        if ($new !== $confirm) {
            return "Passwords do not match.";
        }
    
        // 3) Mindestlänge prüfen
        if (strlen($new) < 8) {
            return "Password must be at least 8 characters long.";
        }
    
        // 4) Komplexität prüfen
        if (!preg_match('/[A-Z]/', $new) ||
            !preg_match('/[a-z]/', $new) ||
            !preg_match('/[0-9]/', $new)) {
            return "Password must contain uppercase, lowercase and a number.";
        }
    
        // 5) Neues Passwort darf nicht dasselbe sein wie das alte (Klartext-Vergleich)
        if (password_verify($new, $row["password"])) {
            return "New password must be different from the current password.";
        }
    
        // 6) Hash und speichern
        $newHash = password_hash($new, PASSWORD_DEFAULT);
        $upd = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        if ($upd === false) {
            error_log("changePassword UPDATE prepare failed: " . $conn->error);
            return "Internal error";
        }
        $upd->bind_param("si", $newHash, $userId);
        return $upd->execute()
            ? true
            : "Could not update password.";
    }
    

    public function getUserOrders(int $userId, $conn): array {
        $stmt = $conn->prepare("
            SELECT id, subtotal, discount, shipping_amount, total_amount, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function getOrderDetails(int $orderId, $conn): array {
        $stmt = $conn->prepare("
            SELECT product_id, name_snapshot, price_snapshot, quantity, total_price
            FROM order_items
            WHERE order_id = ?
        ");
        $stmt->bind_param("i", $orderId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    /**
     * Fügt eine neue Zahlungsmethode für den User hinzu
     */
    public function addPaymentMethod(int $userId, array $data, $conn): bool {
        $sql = "
            INSERT INTO `payments`
              (`user_id`, `method`, `card_number`, `csv`,
               `paypal_email`, `paypal_username`, `iban`, `bic`, `created_at`)
            VALUES (?,?,?,?,?,?,?,?, NOW())
        ";

        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            error_log("addPaymentMethod prepare failed: " . $conn->error);
            return false;
        }

        $cardNumber  = $data['card_number']     ?? null;
        $csv         = $data['csv']             ?? null;
        $paypalEmail = $data['paypal_email']    ?? null;
        $paypalUser  = $data['paypal_username'] ?? null;
        $iban        = $data['iban']            ?? null;
        $bic         = $data['bic']             ?? null;

        $bound = $stmt->bind_param(
            "isssssss",
            $userId,
            $data['method'],
            $cardNumber,
            $csv,
            $paypalEmail,
            $paypalUser,
            $iban,
            $bic
        );
        if ($bound === false) {
            error_log("addPaymentMethod bind_param failed: " . $stmt->error);
            return false;
        }

        $exec = $stmt->execute();
        if ($exec === false) {
            error_log("addPaymentMethod execute failed: " . $stmt->error);
        }

        return $exec;
    }
}
