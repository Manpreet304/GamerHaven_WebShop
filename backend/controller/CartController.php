<?php
require_once(__DIR__ . '/../logic/CartLogic.php');

class CartController {
    private CartLogic $logic;
    private mysqli $conn;

    public function __construct(mysqli $conn) {
        $this->conn = $conn;
        $this->logic = new CartLogic();
    }

    public function getCartCount(int $userId): array {
        return $this->logic->count($userId, $this->conn);
    }

    public function getCartWithSummary(int $userId): array {
        return $this->logic->summary($userId, $this->conn);
    }

    public function addToCart(int $userId, int $productId, int $quantity): array {
        return $this->logic->add($userId, $productId, $quantity, $this->conn);
    }

    public function updateQuantity(int $cartId, int $quantity): array {
        return $this->logic->update($cartId, $quantity, $this->conn);
    }

    public function removeItem(int $cartId): array {
        return $this->logic->remove($cartId, $this->conn);
    }
}
