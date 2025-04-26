<?php
class OrderLogic {

    public function createOrder(int $userId, int $paymentId, ?string $voucherCode, $conn): int {
        $conn->begin_transaction();

        try {
            // === Warenkorb auslesen ===
            $stmt = $conn->prepare("
                SELECT c.product_id, c.quantity, p.name, p.price, p.stock
                FROM cart c
                JOIN products p ON c.product_id = p.id
                WHERE c.user_id = ?
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            $items    = [];
            $subtotal = 0.0;
            while ($row = $result->fetch_assoc()) {
                if ($row["stock"] < $row["quantity"]) {
                    throw new Exception("Product '{$row['name']}' is out of stock or insufficient quantity available.");
                }
                $items[]   = $row;
                $subtotal += $row["price"] * $row["quantity"];
            }
            if (empty($items)) {
                throw new Exception("Cart is empty.");
            }

            // === Gutschein prüfen ===
            $voucherId = null;
            $discount  = 0.0;
            if (!empty($voucherCode)) {
                $vstmt = $conn->prepare("
                    SELECT id, remaining_value
                    FROM vouchers
                    WHERE code = ? AND is_active = 1
                      AND (expires_at IS NULL OR expires_at > NOW())
                ");
                $vstmt->bind_param("s", $voucherCode);
                $vstmt->execute();
                $voucher = $vstmt->get_result()->fetch_assoc();
                if (!$voucher) {
                    throw new Exception("Invalid voucher code.");
                }

                $voucherId = (int)$voucher["id"];
                $discount  = min($voucher["remaining_value"], $subtotal);
                $subtotal -= $discount;
                $remaining = $voucher["remaining_value"] - $discount;
                $active    = $remaining > 0 ? 1 : 0;
            }

            // === Bestellung speichern ===
            $shipping = ($subtotal >= 300.0) ? 0.0 : 9.90;
            $total    = $subtotal + $shipping;
            $istmt    = $conn->prepare("
                INSERT INTO orders
                  (user_id, payment_id, voucher_id, subtotal, discount, shipping_amount, total_amount, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            $istmt->bind_param(
                "iiidddd",
                $userId,
                $paymentId,
                $voucherId,
                $subtotal,
                $discount,
                $shipping,
                $total
            );
            $istmt->execute();

            $orderId = $istmt->insert_id;

            // === Bestellpositionen speichern UND Lagerbestand reduzieren ===
            $pstmt = $conn->prepare("
                INSERT INTO order_items
                  (order_id, product_id, name_snapshot, price_snapshot, quantity, total_price)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            $ustmt = $conn->prepare("
                UPDATE products
                SET stock = stock - ?
                WHERE id = ? AND stock >= ?
            ");

            foreach ($items as $it) {
                $price      = $it["price"];
                $qty        = $it["quantity"];
                $totalPrice = $price * $qty;

                // 1) Bestellposition speichern
                $pstmt->bind_param(
                    "iisdid",
                    $orderId,
                    $it["product_id"],
                    $it["name"],
                    $price,
                    $qty,
                    $totalPrice
                );
                $pstmt->execute();

                // 2) Lagerbestand reduzieren
                $ustmt->bind_param("iii", $qty, $it["product_id"], $qty);
                $ustmt->execute();
            }

            // === Gutschein aktualisieren ===
            if ($voucherId !== null) {
                $ustmt2 = $conn->prepare("
                    UPDATE vouchers
                    SET remaining_value = ?, is_active = ?
                    WHERE id = ?
                ");
                $ustmt2->bind_param("dii", $remaining, $active, $voucherId);
                $ustmt2->execute();
            }

            // === Warenkorb leeren ===
            $dstmt = $conn->prepare("DELETE FROM cart WHERE user_id = ?");
            $dstmt->bind_param("i", $userId);
            $dstmt->execute();

            $conn->commit();

            return $orderId;

        } catch (Exception $e) {
            $conn->rollback();
            throw new Exception("Order creation failed: " . $e->getMessage());
        }
    }
}
?>
