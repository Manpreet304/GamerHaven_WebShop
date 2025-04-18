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
        // Bestellung anlegen und orderId zurückliefern
        $data   = json_decode(file_get_contents("php://input"), true);
        $result = $orderController->placeOrder(
            $userId,
            $data["payment_id"],
            $data["voucher"] ?? null
        );
        // Statuscode und Body genau so weitergeben
        http_response_code($result["status"]);
        echo json_encode($result["body"]);
        exit;

    case "GET":
        if (isset($_GET["orders"])) {
            // Liste aller Bestellungen
            $response = $accountController->getOrders($userId, $conn);

        } elseif (isset($_GET["orderDetails"]) && isset($_GET["orderId"])) {
            // Detaildaten einer einzelnen Bestellung
            $orderId = intval($_GET["orderId"]);

            // 1) Metadaten aus orders
            $stmt = $conn->prepare(
                "SELECT id, created_at, subtotal, discount, shipping_amount, total_amount
                 FROM orders
                 WHERE id = ? AND user_id = ?"
            );
            $stmt->bind_param("ii", $orderId, $userId);
            $stmt->execute();
            $orderData = $stmt->get_result()->fetch_assoc();

            // 2) Positionen aus order_items
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

// Für GET‑Zweige: Status und Body senden
http_response_code($response["status"]);
echo json_encode($response["body"]);
