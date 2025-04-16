<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/cart_controller.php");

$controller = new CartController();

// ✅ Cart Count (GET)
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["cartCount"])) {
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

// ✅ Cart Summary (items + subtotal + shipping + total)
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (!isset($_SESSION["user"]["id"])) {
        http_response_code(401);
        echo json_encode(["errors" => ["general" => "Unauthorized"]]);
        exit;
    }

    $result = $controller->getCartWithSummary($_SESSION["user"]["id"]);
    http_response_code($result["status"]);
    echo json_encode($result["body"]);
    exit;
}

// ✅ POST Requests (add, update, delete)
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!isset($_SESSION["user"]["id"])) {
        http_response_code(401);
        echo json_encode(["errors" => ["general" => "Unauthorized"]]);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // Add to cart
    if (isset($_GET["addToCart"])) {
        $productId = intval($_GET["addToCart"]);
        $quantity = isset($data["quantity"]) ? max(1, intval($data["quantity"])) : 1;
        $result = $controller->addToCart($_SESSION["user"]["id"], $productId, $quantity);
        http_response_code($result["status"]);
        echo json_encode($result["body"]);
        exit;
    }

    // Update quantity
    if ($data["action"] === "update" && isset($data["id"], $data["quantity"])) {
        $cartId = intval($data["id"]);
        $quantity = max(1, intval($data["quantity"]));
        $result = $controller->updateQuantity($cartId, $quantity);
        http_response_code($result["status"]);
        echo json_encode($result["body"]);
        exit;
    }

    // Remove item
    if ($data["action"] === "delete" && isset($data["id"])) {
        $cartId = intval($data["id"]);
        $result = $controller->removeItem($cartId);
        http_response_code($result["status"]);
        echo json_encode($result["body"]);
        exit;
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
