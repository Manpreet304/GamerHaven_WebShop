<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../db/dbaccess.php';
require_once __DIR__ . '/../controller/ProductController.php';

$controller = new ProductController();

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        $filters = [
            "category"  => $_GET["category"] ?? null,
            "brand"     => $_GET["brand"] ?? null,
            "priceMin"  => $_GET["priceMin"] ?? null,
            "priceMax"  => $_GET["priceMax"] ?? null,
            "rating"    => $_GET["rating"] ?? null,
            "stock"     => $_GET["stock"] ?? null,
            "search"    => $_GET["search"] ?? null
        ];
        $result = $controller->getAllFiltered($filters);
        http_response_code($result["status"]);
        echo json_encode($result["body"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
