<?php

class RegisterLogic {
    public function validate(User $user, string $password2, $conn): true|string {
        // Passwort-Abgleich
        if ($user->password !== $password2) {
            return "Passwords do not match.";
        }

        // Passwort-Stärke
        if (strlen($user->password) < 8) {
            return "Password must be at least 8 characters long.";
        }

        if (!preg_match('/[A-Z]/', $user->password) ||
            !preg_match('/[a-z]/', $user->password) ||
            !preg_match('/[0-9]/', $user->password)) {
            return "Password must contain uppercase, lowercase and a number.";
        }

        // E-Mail Format
        if (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            return "Invalid email format.";
        }

        // Username Länge
        if (strlen($user->username) < 5) {
            return "Username must be at least 5 characters long.";
        }

        // Username existiert bereits?
        $sql = "SELECT id FROM users WHERE username = ?";
        $stmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($stmt, "s", $user->username);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);

        if (mysqli_stmt_num_rows($stmt) > 0) {
            return "Username already taken.";
        }

        return true;
    }

    public function save(User $user, $conn): bool {
        $conn->begin_transaction();

        try {
            $sqlUser = "INSERT INTO users 
                (salutation, firstname, lastname, address, zip_code, city, email, username, password, country, created_at, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'user')";

            $stmtUser = mysqli_prepare($conn, $sqlUser);
            $createdAt = date("Y-m-d H:i:s");
            $hashedPassword = password_hash($user->password, PASSWORD_DEFAULT);

            mysqli_stmt_bind_param($stmtUser, "sssssssssss",
                $user->salutation,
                $user->first_name,
                $user->last_name,
                $user->address,
                $user->zip,
                $user->city,
                $user->email,
                $user->username,
                $hashedPassword,
                $user->country,
                $createdAt
            );

            if (!mysqli_stmt_execute($stmtUser)) {
                throw new Exception("Failed to save user");
            }

            $userId = $conn->insert_id;

            // Payment speichern
            $sqlPayment = "INSERT INTO payments 
                (user_id, method, card_number, csv, paypal_email, paypal_username, iban, bic, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmtPayment = mysqli_prepare($conn, $sqlPayment);
            mysqli_stmt_bind_param($stmtPayment, "issssssss",
                $userId,
                $user->payment_method,
                $user->card_number,
                $user->csv,
                $user->paypal_email,
                $user->paypal_username,
                $user->iban,
                $user->bic,
                $createdAt
            );

            if (!mysqli_stmt_execute($stmtPayment)) {
                throw new Exception("Failed to save payment");
            }

            $conn->commit();
            return true;

        } catch (Exception $e) {
            $conn->rollback();
            return false;
        }
    }
}
