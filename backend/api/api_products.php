<?php
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once("../db/dbaccess.php");
require_once("../controller/product_controller.php");

$controller = new ProductController();

// === GET: Produkte abrufen oder Warenkorb-Zähler ===
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (isset($_GET["cartCount"])) {
        if (!isset($_SESSION["user"]["id"])) {
            http_response_code(401);
            echo json_encode(["errors" => ["general" => "Unauthorized"]]);
            exit;
        }

        $result = $controller->getCartCount($_SESSION["user"]["id"]);
        http_response_code($result["status"]);
        echo json_encode($result["body"]);
        exit;
    }

    // 🛍️ Produkte mit Filter laden
    $filters = [
        "category" => $_GET["category"] ?? null,
        "brand" => $_GET["brand"] ?? null,
        "priceMin" => $_GET["priceMin"] ?? null,
        "priceMax" => $_GET["priceMax"] ?? null,
        "rating" => $_GET["rating"] ?? null,
        "stock" => $_GET["stock"] ?? null,
    ];

    $result = $controller->getAllFiltered($filters);
    http_response_code($result["status"]);
    echo json_encode($result["body"]);
    exit;
}

// === POST: Produkt in den Warenkorb legen ===
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["addToCart"])) {
    if (!isset($_SESSION["user"]["id"])) {
        http_response_code(401);
        echo json_encode(["errors" => ["general" => "Unauthorized"]]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $productId = intval($_GET["addToCart"]);
    $userId = $_SESSION["user"]["id"];
    $quantity = isset($data["quantity"]) ? max(1, intval($data["quantity"])) : 1;

    $result = $controller->addToCart($userId, $productId, $quantity);
    http_response_code($result["status"]);
    echo json_encode($result["body"]);
    exit;
}

// ❌ Fallback: Methode nicht erlaubt
http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
