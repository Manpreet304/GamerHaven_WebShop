<?php
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/order_controller.php");
require_once("../controller/account_controller.php");

$orderController = new OrderController();
$accountController = new AccountController();

if (!isset($_SESSION["user"]["id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$userId = $_SESSION["user"]["id"];

// === Bestellung abschicken ===
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $paymentId = intval($data["payment_id"] ?? 0);
    $voucher = $data["voucher"] ?? null;

    $response = $orderController->placeOrder($userId, $paymentId, $voucher);
    http_response_code($response["status"]);
    echo json_encode($response["body"]);
    exit;
}

// === Bestellungen abrufen (Liste + Details) ===
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    if (isset($_GET["orders"])) {
        $response = $accountController->getOrders($userId, $conn);
        http_response_code($response["status"]);
        echo json_encode($response["body"]);
        exit;
    }

    if (isset($_GET["orderDetails"]) && isset($_GET["orderId"])) {
        $orderId = intval($_GET["orderId"]);
        $response = $accountController->getOrderDetails($orderId, $conn);
        http_response_code($response["status"]);
        echo json_encode($response["body"]);
        exit;
    }
}

http_response_code(405);
echo json_encode(["error" => "Method not allowed"]);
