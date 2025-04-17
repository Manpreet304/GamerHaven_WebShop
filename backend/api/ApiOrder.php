<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/OrderController.php");
require_once("../controller/AccountController.php");

if (!isset($_SESSION["user"]["id"])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized"]);
    exit;
}

$userId            = $_SESSION["user"]["id"];
$orderController   = new OrderController();
$accountController = new AccountController();

switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        $data     = json_decode(file_get_contents("php://input"), true);
        $response = $orderController->placeOrder($userId, $data["payment_id"], $data["voucher"] ?? null);
        break;

    case "GET":
        if (isset($_GET["orders"])) {
            // list orders
            $response = $accountController->getOrders($userId, $conn);

        } elseif (isset($_GET["orderDetails"]) && isset($_GET["orderId"])) {
            // einzelne Bestellung + Items
            $orderId = intval($_GET["orderId"]);

            // 1) Metadaten
            $stmt = $conn->prepare(
                "SELECT id, created_at, subtotal, discount, shipping_amount, total_amount
                 FROM orders
                 WHERE id = ? AND user_id = ?"
            );
            $stmt->bind_param("ii", $orderId, $userId);
            $stmt->execute();
            $orderData = $stmt->get_result()->fetch_assoc();

            // 2) Positionsdaten
            $itemsResult = $accountController->getOrderDetails($orderId, $conn);
            $items       = $itemsResult["body"];

            $response = [
                "status" => 200,
                "body"   => [
                    "order" => $orderData,
                    "items" => $items
                ]
            ];
        } else {
            $response = ["status" => 400, "body" => ["error" => "Missing parameter"]];
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        exit;
}

http_response_code($response["status"]);
echo json_encode($response["body"]);
