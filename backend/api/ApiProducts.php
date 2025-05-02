<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/ProductController.php");
require_once("../models/response.php"); // zentrale Helfer

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

        try {
            $result = $controller->getAllFiltered($filters);
            sendApiResponse($result, "Products loaded.", "Failed to load products.");
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(jsonResponse(false, null, "Server error.", [$e->getMessage()]));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(jsonResponse(false, null, "Method not allowed"));
}
