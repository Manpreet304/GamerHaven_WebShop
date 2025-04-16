<?php
class OrderLogic {
    public function createOrder($userId, $paymentId, $voucherCode, $conn): bool {
        $conn->begin_transaction();

        try {
            // Produkte aus Cart holen
            $cartStmt = $conn->prepare("
                SELECT c.product_id, c.quantity, p.price
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            ");
            $cartStmt->bind_param("i", $userId);
            $cartStmt->execute();
            $result = $cartStmt->get_result();

            $items = [];
            $total = 0;
            while ($row = $result->fetch_assoc()) {
                $items[] = $row;
                $total += $row["price"] * $row["quantity"];
            }

            if (empty($items)) throw new Exception("Cart is empty");

            // Gutschein prüfen
            $voucherId = null;
            if ($voucherCode) {
                $voucherStmt = $conn->prepare("
                    SELECT id, remaining_value 
                    FROM vouchers 
                    WHERE code = ? 
                      AND is_active = 1 
                      AND (expiry_date IS NULL OR expiry_date > NOW())
                ");
                $voucherStmt->bind_param("s", $voucherCode);
                $voucherStmt->execute();
                $voucherRes = $voucherStmt->get_result()->fetch_assoc();

                if (!$voucherRes) throw new Exception("Invalid voucher");

                $voucherId = $voucherRes["id"];
                $discount = min($voucherRes["remaining_value"], $total);
                $total -= $discount;

                // Update voucher
                $newRemaining = $voucherRes["remaining_value"] - $discount;
                $updateStmt = $conn->prepare("UPDATE vouchers SET remaining_value = ?, is_active = ? WHERE id = ?");
                $active = $newRemaining > 0 ? 1 : 0;
                $updateStmt->bind_param("dii", $newRemaining, $active, $voucherId);
                $updateStmt->execute();
            }

            // Versand berechnen (z. B. kostenlos ab 300 €)
            $shipping = ($total >= 300) ? 0 : 4.99;
            $grandTotal = $total + $shipping;

            // Bestellung speichern
            $orderStmt = $conn->prepare("
                INSERT INTO orders (user_id, payment_id, voucher_id, total_amount, shipping_amount, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $voucherParam = $voucherId ?? null;
            $orderStmt->bind_param("iiidd", $userId, $paymentId, $voucherParam, $grandTotal, $shipping);
            $orderStmt->execute();
            $orderId = $orderStmt->insert_id;

            // Produkte speichern
            foreach ($items as $item) {
                $prodStmt = $conn->prepare("
                    INSERT INTO order_items (order_id, product_id, quantity, price) 
                    VALUES (?, ?, ?, ?)
                ");
                $prodStmt->bind_param("iiid", $orderId, $item["product_id"], $item["quantity"], $item["price"]);
                $prodStmt->execute();
            }

            // Cart leeren
            $delStmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $delStmt->bind_param("i", $userId);
            $delStmt->execute();

            $conn->commit();
            return true;
        } catch (Exception $e) {
            $conn->rollback();
            return false;
        }
    }
}
