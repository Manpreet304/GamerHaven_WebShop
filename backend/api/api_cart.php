<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/cart_controller.php");

if (!isset($_SESSION["user"]["id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$controller = new CartController();
$userId = $_SESSION["user"]["id"];

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        if (isset($_GET["cartCount"])) {
            $result = $controller->getCartCount($userId);
        } else {
            $result = $controller->getCartWithSummary($userId);
        }
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($_GET["addToCart"])) {
            $productId = intval($_GET["addToCart"]);
            $quantity = max(1, intval($data["quantity"] ?? 1));
            $result = $controller->addToCart($userId, $productId, $quantity);
        } elseif ($data["action"] === "update") {
            $result = $controller->updateQuantity(intval($data["id"]), intval($data["quantity"]));
        } elseif ($data["action"] === "delete") {
            $result = $controller->removeItem(intval($data["id"]));
        } else {
            $result = ["status" => 400, "body" => ["error" => "Invalid action"]];
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
}

http_response_code($result["status"]);
echo json_encode($result["body"]);
