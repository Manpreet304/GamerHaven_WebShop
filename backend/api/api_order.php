<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/order_controller.php");

$controller = new OrderController();

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    if (!isset($_SESSION["user"]["id"])) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }

    $userId = $_SESSION["user"]["id"];
    $data = json_decode(file_get_contents("php://input"), true);
    $paymentId = intval($data["payment_id"] ?? 0);
    $voucher = $data["voucher"] ?? null;

    $result = $controller->placeOrder($userId, $paymentId, $voucher);
    http_response_code($result["status"]);
    echo json_encode($result["body"]);
    exit;
}

http_response_code(405);
