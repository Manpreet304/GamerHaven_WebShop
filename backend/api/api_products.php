<?php
header("Content-Type: application/json");
require_once("../db/dbaccess.php");
require_once("../controller/product_controller.php");

$controller = new ProductController();

if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $result = $controller->getAll();
    http_response_code($result["status"]);
    echo json_encode($result["body"]);
    exit;
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
