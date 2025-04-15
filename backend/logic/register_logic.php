<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class RegisterLogic {
    public function validate(User $user, string $password2, $conn): true|array {
        $errors = [];

        if ($user->password !== $password2) {
            $errors["password2"] = "Passwords do not match.";
        }

        if (strlen($user->password) < 8) {
            $errors["password"] = "Password must be at least 8 characters long.";
        }

        if (!preg_match('/[A-Z]/', $user->password) ||
            !preg_match('/[a-z]/', $user->password) ||
            !preg_match('/[0-9]/', $user->password)) {
            $errors["password"] = "Password must contain uppercase, lowercase and a number.";
        }

        if (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            $errors["email"] = "Invalid email format.";
        }

        if (strlen($user->username) < 5) {
            $errors["username"] = "Username must be at least 5 characters long.";
        } else {
            $sql = "SELECT id FROM users WHERE username = ?";
            $stmt = mysqli_prepare($conn, $sql);
            mysqli_stmt_bind_param($stmt, "s", $user->username);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_store_result($stmt);

            if (mysqli_stmt_num_rows($stmt) > 0) {
                $errors["username"] = "Username already taken.";
            }
        }

        // Zahlungsdaten prüfen
        if ($user->payment_method === "Credit Card") {
            if (empty($user->card_number)) $errors["card_number"] = "Card number is required.";
            if (empty($user->csv)) $errors["csv"] = "CSV is required.";
        }

        if ($user->payment_method === "PayPal") {
            if (empty($user->paypal_email)) $errors["paypal_email"] = "PayPal email is required.";
            if (empty($user->paypal_username)) $errors["paypal_username"] = "PayPal username is required.";
        }

        if ($user->payment_method === "Bank Transfer") {
            if (empty($user->iban)) $errors["iban"] = "IBAN is required.";
            if (empty($user->bic)) $errors["bic"] = "BIC is required.";
        }

        return empty($errors) ? true : $errors;
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

            $card_number     = $user->payment_method === "Credit Card"   ? $user->card_number    : null;
            $csv             = $user->payment_method === "Credit Card"   ? $user->csv            : null;
            $paypal_email    = $user->payment_method === "PayPal"        ? $user->paypal_email   : null;
            $paypal_username = $user->payment_method === "PayPal"        ? $user->paypal_username: null;
            $iban            = $user->payment_method === "Bank Transfer" ? $user->iban           : null;
            $bic             = $user->payment_method === "Bank Transfer" ? $user->bic            : null;

            $sqlPayment = "INSERT INTO payments 
                (user_id, method, card_number, csv, paypal_email, paypal_username, iban, bic, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmtPayment = mysqli_prepare($conn, $sqlPayment);
            mysqli_stmt_bind_param($stmtPayment, "issssssss",
                $userId,
                $user->payment_method,
                $card_number,
                $csv,
                $paypal_email,
                $paypal_username,
                $iban,
                $bic,
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