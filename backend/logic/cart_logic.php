<?php

class CartLogic {

    public function addToCart(int $userId, int $productId, int $quantity, $conn): bool {
        $stmt = $conn->prepare("SELECT id FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->bind_param("ii", $userId, $productId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {
            // Produkt ist bereits im Warenkorb – Menge erhöhen
            $stmt = $conn->prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?");
            $stmt->bind_param("ii", $quantity, $row["id"]);
        } else {
            // Produkt neu in den Warenkorb einfügen
            $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $userId, $productId, $quantity);
        }

        return $stmt->execute();
    }

    public function getCartCount(int $userId, $conn): int {
        $stmt = $conn->prepare("SELECT SUM(quantity) AS total FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();

        return (int)($row["total"] ?? 0);
    }

    public function getCartItems(int $userId, $conn): array {
        $stmt = $conn->prepare("
            SELECT c.id, p.name, p.price, c.quantity 
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        return $items;
    }

    public function updateQuantity(int $cartId, int $quantity, $conn): bool {
        $stmt = $conn->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
        $stmt->bind_param("ii", $quantity, $cartId);
        return $stmt->execute();
    }

    public function deleteCartItem(int $cartId, $conn): bool {
        $stmt = $conn->prepare("DELETE FROM cart WHERE id = ?");
        $stmt->bind_param("i", $cartId);
        return $stmt->execute();
    }

    public function getCartWithSummary(int $userId, $conn): array {
        $stmt = $conn->prepare("
            SELECT c.id, c.product_id, p.name, p.price, c.quantity
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        $items = [];
        $subtotal = 0;

        while ($row = $result->fetch_assoc()) {
            $row["price"] = floatval($row["price"]);
            $row["quantity"] = intval($row["quantity"]);
            $items[] = $row;
            $subtotal += $row["price"] * $row["quantity"];
        }

        $shipping = $subtotal >= 300 ? 0 : 9.90;
        $total = $subtotal + $shipping;

        return [
            "items" => $items,
            "subtotal" => round($subtotal, 2),
            "shipping" => round($shipping, 2),
            "total" => round($total, 2)
        ];
    }
}
