<?php
class CartLogic {
    public function addToCart(int $userId, int $productId, int $quantity, $conn): bool {
        $check = $conn->prepare("SELECT id FROM cart WHERE user_id = ? AND product_id = ?");
        $check->bind_param("ii", $userId, $productId);
        $check->execute();
        $res = $check->get_result();

        if ($item = $res->fetch_assoc()) {
            $stmt = $conn->prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?");
            $stmt->bind_param("ii", $quantity, $item["id"]);
        } else {
            $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->bind_param("iii", $userId, $productId, $quantity);
        }
        return $stmt->execute();
    }

    public function getCartCount(int $userId, $conn): int {
        $stmt = $conn->prepare("SELECT SUM(quantity) AS total FROM cart WHERE user_id = ?");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        return (int)($row["total"] ?? 0);
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
            SELECT c.id, p.name, p.price, c.quantity
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $res = $stmt->get_result();

        $items    = [];
        $subtotal = 0;
        while ($r = $res->fetch_assoc()) {
            $r["price"]    = (float)$r["price"];
            $r["quantity"] = (int)$r["quantity"];
            $items[]       = $r;
            $subtotal     += $r["price"] * $r["quantity"];
        }
        $shipping = $subtotal >= 300 ? 0 : 9.90;
        $total    = $subtotal + $shipping;

        return [
            "items"    => $items,
            "subtotal" => round($subtotal, 2),
            "shipping" => round($shipping, 2),
            "total"    => round($total, 2)
        ];
    }
}
