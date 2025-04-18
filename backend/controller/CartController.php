<?php
require_once("../logic/CartLogic.php");

class CartController {
    private CartLogic $logic;

    public function __construct() {
        $this->logic = new CartLogic();
    }

    public function getCartCount(int $userId): array {
        global $conn;
        $count = $this->logic->getCartCount($userId, $conn);
        return ["status" => 200, "body" => ["count" => $count]];
    }

    public function getCartWithSummary(int $userId): array {
        global $conn;
        $summary = $this->logic->getCartWithSummary($userId, $conn);
        return ["status" => 200, "body" => $summary];
    }

    public function addToCart(int $userId, int $productId, int $quantity): array {
        global $conn;
        $ok = $this->logic->addToCart($userId, $productId, $quantity, $conn);
        return ["status" => $ok ? 200 : 500, "body" => ["success" => $ok]];
    }

    public function updateQuantity(int $cartId, int $quantity): array {
        global $conn;
        $ok = $this->logic->updateQuantity($cartId, $quantity, $conn);
        return ["status" => $ok ? 200 : 500, "body" => ["success" => $ok]];
    }

    public function removeItem(int $cartId): array {
        global $conn;
        $ok = $this->logic->deleteCartItem($cartId, $conn);
        return ["status" => $ok ? 200 : 500, "body" => ["success" => $ok]];
    }
}
