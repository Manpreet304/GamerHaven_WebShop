<?php
require_once("../logic/ProductLogic.php");

class ProductController {
    private ProductLogic $logic;

    public function __construct(mysqli $conn) {
        $this->logic = new ProductLogic($conn);
    }

    public function getAll(): array {
        return $this->logic->getAllProducts();
    }

    public function getAllFiltered(array $filters): array {
        return $this->logic->getFilteredProducts($filters);
    }
}
