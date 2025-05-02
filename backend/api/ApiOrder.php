<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/OrderController.php");
require_once("../controller/AccountController.php");
require_once("../models/response.php"); // zentraler Response-Helper

if (!isset($_SESSION["user"]["id"])) {
    http_response_code(401);
    echo json_encode(jsonResponse(false, null, "Unauthorized!"));
    exit;
}

$userId            = $_SESSION["user"]["id"];
$orderController   = new OrderController();
$accountController = new AccountController();

switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);
        sendApiResponse(
            $orderController->placeOrder(
                $userId,
                $data["payment_id"],
                $data["voucher"] ?? null
            ),
            "Order placed.",
            "Order failed."
        );

    case "GET":
        if (isset($_GET["orders"])) {
            sendApiResponse([
                "status" => 200,
                "body" => $accountController->getOrders($userId, $conn)
            ], "Orders loaded.");

        } elseif (isset($_GET["orderDetails"]) && isset($_GET["orderId"])) {
            $orderId = intval($_GET["orderId"]);

            // Bestellung abrufen
            $stmt = $conn->prepare("
                SELECT id, created_at, subtotal, discount, shipping_amount, total_amount
                FROM orders
                WHERE id = ? AND user_id = ?
            ");
            $stmt->bind_param("ii", $orderId, $userId);
            $stmt->execute();
            $orderData = $stmt->get_result()->fetch_assoc();

            if (!$orderData) {
                sendApiResponse(["status" => 404, "body" => null], "Not found", "Order not found.");
            }

            $itemsResult = $accountController->getOrderDetails($orderId, $conn);
            $items = $itemsResult["body"];

            sendApiResponse([
                "status" => 200,
                "body" => [
                    "order" => $orderData,
                    "items" => $items
                ]
            ], "Order details loaded.");
        }

        sendApiResponse(["status" => 400, "body" => null], "", "Missing parameter");

    default:
        http_response_code(405);
        echo json_encode(jsonResponse(false, null, "Method not allowed"));
        exit;
}
