<?php
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/product_controller.php");

$controller = new ProductController();

// === GET: Produkte (gefiltert oder alle) ===
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $filters = [
        "category"  => $_GET["category"] ?? null,
        "brand"     => $_GET["brand"] ?? null,
        "priceMin"  => $_GET["priceMin"] ?? null,
        "priceMax"  => $_GET["priceMax"] ?? null,
        "rating"    => $_GET["rating"] ?? null,
        "stock"     => $_GET["stock"] ?? null,
    ];

    $result = $controller->getAllFiltered($filters);
    http_response_code($result["status"]);
    echo json_encode($result["body"]);
    exit;
}

// ❌ Fallback
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
