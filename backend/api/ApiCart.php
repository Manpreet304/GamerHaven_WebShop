<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/CartController.php");

if (!isset($_SESSION["user"]["id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$controller = new CartController();
$userId     = $_SESSION["user"]["id"];
$result     = ["status" => 400, "body" => ["error" => "Invalid request"]];

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
            $pid     = intval($_GET["addToCart"]);
            $qty     = max(1, intval($data["quantity"] ?? 1));
            $result  = $controller->addToCart($userId, $pid, $qty);
        } elseif (!empty($data["action"]) && $data["action"] === "update") {
            $result = $controller->updateQuantity(intval($data["id"]), intval($data["quantity"]));
        } elseif (!empty($data["action"]) && $data["action"] === "delete") {
            $result = $controller->removeItem(intval($data["id"]));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
}

http_response_code($result["status"]);
echo json_encode($result["body"]);
