<?php

class UserService {
    public function validate(User $user, string $password2): true|string {
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

        // Email prüfen
        if (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            return "Invalid email format.";
        }

        // Username prüfen
        if (strlen($user->username) < 5) {
            return "Username must be at least 5 characters long.";
        }

        return true;
    }

    public function save(User $user, $conn): bool {
        $sql = "INSERT INTO users 
                (salutation, firstname, lastname, address, zip_code, city, email, username, password, payment_method, payment_information, country, created_at, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'customer')";

        $stmt = mysqli_prepare($conn, $sql);
        $created_at = date("Y-m-d H:i:s");
        $hashedPassword = password_hash($user->password, PASSWORD_DEFAULT);

        mysqli_stmt_bind_param($stmt, "sssssssssssss",
            $user->salutation,
            $user->first_name,
            $user->last_name,
            $user->address,
            $user->zip,
            $user->city,
            $user->email,
            $user->username,
            $hashedPassword,
            $user->payment_method,
            $user->payment_info,
            $user->country,
            $created_at
        );

        return mysqli_stmt_execute($stmt);
    }
}
