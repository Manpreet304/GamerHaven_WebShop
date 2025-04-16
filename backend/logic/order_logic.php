<?php

class OrderLogic {
    public function createOrder($userId, $paymentId, $voucherCode, $conn): bool {
        $conn->begin_transaction();

        try {
            // === 1. Warenkorb prüfen ===
            $cartStmt = $conn->prepare("
                SELECT c.product_id, c.quantity, p.name, p.price
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            ");
            $cartStmt->bind_param("i", $userId);
            $cartStmt->execute();
            $result = $cartStmt->get_result();

            $items = [];
            $subtotal = 0;
            while ($row = $result->fetch_assoc()) {
                $items[] = $row;
                $subtotal += $row["price"] * $row["quantity"];
            }

            if (empty($items)) {
                throw new Exception("Cart is empty.");
            }

            // === 2. Gutschein prüfen ===
            $voucherId = null;
            $discount = 0;

            if (!empty($voucherCode)) {
                $voucherStmt = $conn->prepare("
                    SELECT id, remaining_value 
                    FROM vouchers 
                    WHERE code = ? 
                      AND is_active = 1 
                      AND (expires_at IS NULL OR expires_at > NOW())
                ");
                $voucherStmt->bind_param("s", $voucherCode);
                $voucherStmt->execute();
                $voucherRes = $voucherStmt->get_result()->fetch_assoc();

                if (!$voucherRes) {
                    throw new Exception("Invalid voucher code.");
                }

                $voucherId = $voucherRes["id"];
                $discount = min($voucherRes["remaining_value"], $subtotal);
                $subtotal -= $discount;

                $newRemaining = $voucherRes["remaining_value"] - $discount;
                $active = $newRemaining > 0 ? 1 : 0;
            }

            // === 3. Versand & Total berechnen ===
            $shipping = ($subtotal >= 300) ? 0 : 4.99;
            $total = $subtotal + $shipping;

            // === 4. Bestellung einfügen ===
            $orderStmt = $conn->prepare("
                INSERT INTO orders (user_id, payment_id, voucher_id, subtotal, discount, shipping_amount, total_amount, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $orderStmt->bind_param("iiidddd", $userId, $paymentId, $voucherId, $subtotal, $discount, $shipping, $total);
            $orderStmt->execute();
            $orderId = $orderStmt->insert_id;

            // === 5. Produkte in order_items einfügen (ohne Spalte 'price') ===
            foreach ($items as $item) {
                $name = $item["name"];
                $price = $item["price"];
                $quantity = $item["quantity"];
                $totalPrice = $price * $quantity;

                $itemStmt = $conn->prepare("
                    INSERT INTO order_items (order_id, product_id, name_snapshot, price_snapshot, quantity, total_price)
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $itemStmt->bind_param("iisdid", $orderId, $item["product_id"], $name, $price, $quantity, $totalPrice);
                $itemStmt->execute();
            }

            // === 6. Gutschein aktualisieren ===
            if ($voucherId !== null) {
                $updateStmt = $conn->prepare("
                    UPDATE vouchers SET remaining_value = ?, is_active = ? WHERE id = ?
                ");
                $updateStmt->bind_param("dii", $newRemaining, $active, $voucherId);
                $updateStmt->execute();
            }

            // === 7. Cart leeren ===
            $clearStmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $clearStmt->bind_param("i", $userId);
            $clearStmt->execute();

            $conn->commit();
            return true;
        } catch (Exception $e) {
            $conn->rollback();
            throw new Exception("Order creation failed: " . $e->getMessage());
        }
    }
}
