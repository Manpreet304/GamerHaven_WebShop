<?php
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../logic/cart_logic.php");

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

    public function addToCart(int $userId, int $productId, int $quantity): array {
        global $conn;
        $success = $this->logic->addToCart($userId, $productId, $quantity, $conn);
        return ["status" => $success ? 200 : 500, "body" => ["success" => $success]];
    }

    public function getItems(int $userId): array {
        global $conn;
        $items = $this->logic->getCartItems($userId, $conn);
        return ["status" => 200, "body" => $items];
    }

    public function updateQuantity(int $cartId, int $quantity): array {
        global $conn;
        $success = $this->logic->updateQuantity($cartId, $quantity, $conn);
        return ["status" => $success ? 200 : 500, "body" => ["success" => $success]];
    }

    public function removeItem(int $cartId): array {
        global $conn;
        $success = $this->logic->deleteCartItem($cartId, $conn);
        return ["status" => $success ? 200 : 500, "body" => ["success" => $success]];
    }

    public function getCartWithSummary(int $userId): array {
        global $conn;
        $summary = $this->logic->getCartWithSummary($userId, $conn);
        return ["status" => 200, "body" => $summary];
    }

