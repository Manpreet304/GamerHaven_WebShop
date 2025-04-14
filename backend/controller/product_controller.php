<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

class ProductController {
    public function getAll(): array {
        global $conn;
        require_once("../logic/product_logic.php");

        $logic = new ProductLogic();
        $products = $logic->getAllProducts($conn);

        return [
            "status" => 200,
            "body" => $products
        ];
    }

    public function getAllFiltered(array $filters): array {
        global $conn;
        require_once("../logic/product_logic.php");

        $logic = new ProductLogic();
        $products = $logic->getFilteredProducts($conn, $filters);

        return [
            "status" => 200,
            "body" => $products
        ];
    }

    public function addToCart(int $userId, int $productId, int $quantity): array {
        global $conn;
        require_once("../logic/cart_logic.php");

        $success = addToCart($userId, $productId, $quantity, $conn);

        return [
            "status" => $success ? 200 : 500,
            "body" => ["success" => $success]
        ];
    }

    public function getCartCount(int $userId): array {
        global $conn;
        require_once("../logic/cart_logic.php");

        $count = getCartCount($userId, $conn);

        return [
            "status" => 200,
            "body" => ["count" => $count]
        ];
    }
} ;