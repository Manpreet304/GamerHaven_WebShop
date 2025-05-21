<?php
declare(strict_types=1);

class AdminOrderLogic {

    // Gibt alle Bestellungen im System zurück (adminweit)
    public function listAll(mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, user_id, created_at, subtotal, discount, shipping_amount, total_amount
            FROM orders
            ORDER BY created_at DESC
        ");
        $stmt->execute();
        $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        return [200, $orders, "All orders loaded"];
    }

    // Gibt alle Bestellungen eines bestimmten Kunden zurück
    public function listByCustomer(int $userId, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, created_at, subtotal, discount, shipping_amount, total_amount
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $orders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        return [200, $orders, "Orders loaded"];
    }

    // Gibt die Artikel (Positionen) einer bestimmten Bestellung zurück
    public function listItems(int $orderId, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, name_snapshot, price_snapshot, quantity, total_price
            FROM order_items
            WHERE order_id = ?
        ");
        $stmt->bind_param("i", $orderId);
        $stmt->execute();
        $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

        return [200, $items, "Order items loaded"];
    }

    // Entfernt oder reduziert die Menge eines Artikels aus einer Bestellung
    public function removeItem(int $itemId, int $qty, mysqli $conn): array {
        // Artikelinformationen abfragen
        $stmt = $conn->prepare("
            SELECT order_id, quantity, price_snapshot 
            FROM order_items 
            WHERE id = ?
        ");
        $stmt->bind_param("i", $itemId);
        $stmt->execute();
        $item = $stmt->get_result()->fetch_assoc();

        if (!$item) {
            return [404, null, "Item not found"];
        }

        $orderId      = (int)$item['order_id'];
        $currentQty   = (int)$item['quantity'];
        $pricePerUnit = (float)$item['price_snapshot'];

        //Artikel vollständig entfernen
        if ($qty >= $currentQty) {
            $delItem = $conn->prepare("DELETE FROM order_items WHERE id = ?");
            $delItem?->bind_param("i", $itemId);
            $delItem?->execute();

            // Prüfen, ob Bestellung danach leer ist → ggf. ganze Bestellung löschen
            $countStmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM order_items WHERE order_id = ?");
            $countStmt?->bind_param("i", $orderId);
            $countStmt?->execute();
            $result = $countStmt?->get_result();
            $cnt = (int)($result ? $result->fetch_assoc()['cnt'] : 0);

            if ($cnt === 0) {
                $delOrder = $conn->prepare("DELETE FROM orders WHERE id = ?");
                $delOrder?->bind_param("i", $orderId);
                $delOrder?->execute();
            }

        // Artikelmenge reduzieren 
        } else {
            $newQty   = $currentQty - $qty;
            $newTotal = $newQty * $pricePerUnit;

            $upd = $conn->prepare("UPDATE order_items SET quantity = ?, total_price = ? WHERE id = ?");
            $upd?->bind_param("idi", $newQty, $newTotal, $itemId);
            $upd?->execute();
        }

        // Neue Zwischensumme der Bestellung berechnen
        $rs = $conn->prepare("SELECT COALESCE(SUM(total_price),0) AS subtotal FROM order_items WHERE order_id = ?");
        $rs->bind_param("i", $orderId);
        $rs->execute();
        $subtotal = (float)$rs->get_result()->fetch_assoc()['subtotal'];

        // Versandkosten abhängig von Zwischensumme (ab 300€ versandkostenfrei)
        $shipping = $subtotal >= 300.0 ? 0.0 : 9.90;
        $total    = $subtotal + $shipping;

        // Bestellung aktualisieren mit neuen Werten
        $us = $conn->prepare("
            UPDATE orders SET subtotal = ?, shipping_amount = ?, total_amount = ? 
            WHERE id = ?
        ");
        $us->bind_param("dddi", $subtotal, $shipping, $total, $orderId);
        $ok = $us->execute();

        return $ok
            ? [200, ['removed' => true], "Item removed and totals updated"]
            : [500, ['removed' => false], "Failed to update order totals"];
    }
}
