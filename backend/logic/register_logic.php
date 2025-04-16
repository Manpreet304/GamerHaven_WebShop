<?php
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

        $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->bind_param("s", $user->username);
        $stmt->execute();
        $stmt->store_result();
        if ($stmt->num_rows > 0) {
            $errors["username"] = "Username already taken.";
        }

        return empty($errors) ? true : $errors;
    }

    public function save(User $user, $conn): bool {
        $conn->begin_transaction();

        try {
            $sql = "INSERT INTO users (salutation, firstname, lastname, address, zip_code, city, email, username, password, country, created_at, role)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'user')";

            $stmt = $conn->prepare($sql);
            $hashed = password_hash($user->password, PASSWORD_DEFAULT);

            $stmt->bind_param("ssssssssss",
                $user->salutation,
                $user->first_name,
                $user->last_name,
                $user->address,
                $user->zip,
                $user->city,
                $user->email,
                $user->username,
                $hashed,
                $user->country
            );
            $stmt->execute();
            $userId = $conn->insert_id;

            $sql2 = "INSERT INTO payments (user_id, method, card_number, csv, paypal_email, paypal_username, iban, bic, created_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

            $stmt2 = $conn->prepare($sql2);
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

            $conn->commit();
            return true;
        } catch (Exception $e) {
            $conn->rollback();
            return false;
        }
    }
}
