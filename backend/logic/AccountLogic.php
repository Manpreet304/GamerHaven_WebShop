<?php
declare(strict_types=1);

class AccountLogic {
    public function updateUser(int $userId, array $data, $conn): bool {
        $sql = "UPDATE users
                SET firstname = ?, lastname = ?, email = ?, address = ?, zip_code = ?, city = ?, country = ?
                WHERE id = ?";
        $stmt = $conn->prepare($sql);
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
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        return $row && password_verify($password, $row["password"]);
    }

    public function changePassword(int $userId, array $data, $conn) {
        // verify old
        $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        if (!$row || !password_verify($data["old_password"], $row["password"])) {
            return "Current password is incorrect.";
        }
        // hash & update
        $newHash = password_hash($data["new_password"], PASSWORD_DEFAULT);
        $upd = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $upd->bind_param("si", $newHash, $userId);
        return $upd->execute() ? true : "Could not update password.";
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
}
