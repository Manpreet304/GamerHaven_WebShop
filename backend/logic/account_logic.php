<?php

class AccountLogic {
    // === Accountdaten aktualisieren ===
    public function updateUser(int $userId, array $data, $conn): bool {
        if (empty($data['first_name']) || empty($data['last_name']) || empty($data['email'])) {
            return false;
        }

        $sql = "UPDATE users SET
                    first_name = ?, last_name = ?, email = ?, 
                    address = ?, zip_code = ?, city = ?, country = ?
                WHERE id = ?";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "sssssssi", 
            $data['first_name'], 
            $data['last_name'], 
            $data['email'], 
            $data['address'], 
            $data['zip_code'], 
            $data['city'], 
            $data['country'], 
            $userId
        );

        return $stmt->execute();
    }

    // === Zahlungsmethode hinzufügen ===
    public function addPaymentMethod(int $userId, array $data, $conn): bool {
        if (empty($data['method'])) {
            return false;
        }

        $sql = "INSERT INTO payments (user_id, method, card_number, csv, paypal_email, paypal_username, iban, bic, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param(
            "isssssss", 
            $userId, 
            $data['method'], 
            $data['card_number'], 
            $data['csv'], 
            $data['paypal_email'], 
            $data['paypal_username'], 
            $data['iban'], 
            $data['bic']
        );

        return $stmt->execute();
    }

    // === Zahlungsmethode entfernen ===
    public function removePaymentMethod(int $paymentId, $conn): bool {
        $sql = "DELETE FROM payments WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $paymentId);
        return $stmt->execute();
    }

    // === Alle Bestellungen eines Users abrufen ===
    public function getUserOrders(int $userId, $conn): array {
        $stmt = $conn->prepare("
            SELECT id, subtotal, discount, shipping_amount, total_amount, created_at
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $orders = [];
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }

        return $orders;
    }

    // === Details zu einer bestimmten Bestellung laden ===
    public function getOrderDetails(int $orderId, $conn): array {
        $stmt = $conn->prepare("
            SELECT oi.id, oi.product_id, oi.name_snapshot, oi.price_snapshot, oi.quantity, oi.total_price
            FROM order_items oi
            WHERE oi.order_id = ?
        ");
        $stmt->bind_param("i", $orderId);
        $stmt->execute();
        $result = $stmt->get_result();

        $orderItems = [];
        while ($row = $result->fetch_assoc()) {
            $orderItems[] = $row;
        }

        return $orderItems;
    }
}
