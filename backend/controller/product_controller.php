<?php
require_once("../logic/product_logic.php");

class ProductController {
    private ProductLogic $logic;

    public function __construct() {
        $this->logic = new ProductLogic();
    }

    public function getAll(): array {
        global $conn;
        return [
            "status" => 200,
            "body" => $this->logic->getAllProducts($conn)
        ];
    }

    public function getAllFiltered(array $filters): array {
        global $conn;
        return [
            "status" => 200,
            "body" => $this->logic->getFilteredProducts($conn, $filters)
        ];
    }
}
