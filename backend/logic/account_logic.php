<?php
class AccountLogic {
    public function updateUser(int $userId, array $data, $conn): bool {
        $sql = "UPDATE users SET first_name = ?, last_name = ?, email = ?, address = ?, zip_code = ?, city = ?, country = ? WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssi", $data["first_name"], $data["last_name"], $data["email"], $data["address"], $data["zip_code"], $data["city"], $data["country"], $userId);
        return $stmt->execute();
    }

    public function addPaymentMethod(int $userId, array $data, $conn): bool {
        $sql = "INSERT INTO payments (user_id, method, card_number, csv, paypal_email, paypal_username, iban, bic, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isssssss", $userId, $data["method"], $data["card_number"], $data["csv"], $data["paypal_email"], $data["paypal_username"], $data["iban"], $data["bic"]);
        return $stmt->execute();
    }

    public function removePaymentMethod(int $paymentId, $conn): bool {
        $stmt = $conn->prepare("DELETE FROM payments WHERE id = ?");
        $stmt->bind_param("i", $paymentId);
        return $stmt->execute();
    }

    public function getUserOrders(int $userId, $conn): array {
        $stmt = $conn->prepare("SELECT id, subtotal, discount, shipping_amount, total_amount, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }

    public function getOrderDetails(int $orderId, $conn): array {
        $stmt = $conn->prepare("SELECT product_id, name_snapshot, price_snapshot, quantity, total_price FROM order_items WHERE order_id = ?");
        $stmt->bind_param("i", $orderId);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
    }
}
