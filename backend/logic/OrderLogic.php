<?php
class OrderLogic {
    public function createOrder($userId, $paymentId, $voucherCode, $conn): bool {
        $conn->begin_transaction();

        try {
            // === Warenkorb
            $stmt = $conn->prepare("SELECT c.product_id, c.quantity, p.name, p.price FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            $items = [];
            $subtotal = 0;
            while ($row = $result->fetch_assoc()) {
                $items[] = $row;
                $subtotal += $row["price"] * $row["quantity"];
            }

            if (empty($items)) throw new Exception("Cart is empty.");

            // === Gutschein prüfen
            $voucherId = null;
            $discount = 0;
            if (!empty($voucherCode)) {
                $vstmt = $conn->prepare("SELECT id, remaining_value FROM vouchers WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())");
                $vstmt->bind_param("s", $voucherCode);
                $vstmt->execute();
                $voucher = $vstmt->get_result()->fetch_assoc();
                if (!$voucher) throw new Exception("Invalid voucher code.");

                $voucherId = $voucher["id"];
                $discount = min($voucher["remaining_value"], $subtotal);
                $subtotal -= $discount;
                $remaining = $voucher["remaining_value"] - $discount;
                $active = $remaining > 0 ? 1 : 0;
            }

            // === Bestellung speichern
            $shipping = $subtotal >= 300 ? 0 : 9.90;
            $total = $subtotal + $shipping;
            $stmt = $conn->prepare("INSERT INTO orders (user_id, payment_id, voucher_id, subtotal, discount, shipping_amount, total_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
            $stmt->bind_param("iiidddd", $userId, $paymentId, $voucherId, $subtotal, $discount, $shipping, $total);
            $stmt->execute();
            $orderId = $stmt->insert_id;

            // === Bestellpositionen
            foreach ($items as $item) {
                $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, name_snapshot, price_snapshot, quantity, total_price) VALUES (?, ?, ?, ?, ?, ?)");
                $price = $item["price"];
                $qty = $item["quantity"];
                $totalPrice = $price * $qty;
                $stmt->bind_param("iisdid", $orderId, $item["product_id"], $item["name"], $price, $qty, $totalPrice);
                $stmt->execute();
            }

            // === Gutschein aktualisieren
            if ($voucherId !== null) {
                $stmt = $conn->prepare("UPDATE vouchers SET remaining_value = ?, is_active = ? WHERE id = ?");
                $stmt->bind_param("dii", $remaining, $active, $voucherId);
                $stmt->execute();
            }

            // === Warenkorb leeren
            $stmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->bind_param("i", $userId);
            $stmt->execute();

            $conn->commit();
            return true;
        } catch (Exception $e) {
            $conn->rollback();
            throw new Exception("Order creation failed: " . $e->getMessage());
        }
    }
}
