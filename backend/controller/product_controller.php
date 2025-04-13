<?php

require_once(__DIR__ . "/../logic/product_logic.php");

class ProductController {
    public function getAll(): array {
        global $conn;

        $logic = new ProductLogic();
        $products = $logic->getAllProducts($conn);

        return [
            "status" => 200,
            "body" => $products
        ];
    }
}
