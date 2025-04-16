<?php
if (session_status() === PHP_SESSION_NONE) session_start();

class ProductController {
    public function getAll(): array {
        global $conn;
        require_once("../logic/product_logic.php");
        $logic = new ProductLogic();
        return [
            "status" => 200,
            "body" => $logic->getAllProducts($conn)
        ];
    }

    public function getAllFiltered(array $filters): array {
        global $conn;
        require_once("../logic/product_logic.php");
        $logic = new ProductLogic();
    
        $filters["search"] = $filters["search"] ?? null;
    
        return [
            "status" => 200,
            "body" => $logic->getFilteredProducts($conn, $filters)
        ];
    }
    
}
