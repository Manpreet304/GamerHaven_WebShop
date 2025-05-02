<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../db/dbaccess.php';
require_once __DIR__ . '/../controller/CartController.php';
require_once __DIR__ . '/../models/response.php'; // <- zentrale jsonResponse/sendApiResponse

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(jsonResponse(false, null, 'Please log in to add items to your cart!'));
    exit;
}

$ctrl   = new CartController();
$userId = $_SESSION['user']['id'];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (isset($_GET['cartCount'])) {
            $count = $ctrl->getCartCount($userId);
            sendApiResponse([
                "status" => 200,
                "body" => $count
            ], "Cart count loaded.");
        } else {
            $cart = $ctrl->getCartWithSummary($userId);
            sendApiResponse([
                "status" => 200,
                "body" => $cart
            ], "Cart loaded.");
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($_GET['addToCart'])) {
            $pid = (int)$_GET['addToCart'];
            $qty = max(1, (int)($data['quantity'] ?? 1));
            sendApiResponse(
                $ctrl->addToCart($userId, $pid, $qty),
                "Product added to cart.",
                "Failed to add product to cart."
            );

        } elseif (!empty($data['action']) && $data['action'] === 'update') {
            sendApiResponse(
                $ctrl->updateQuantity((int)$data['id'], (int)$data['quantity']),
                "Quantity updated.",
                "Failed to update quantity."
            );

        } elseif (!empty($data['action']) && $data['action'] === 'delete') {
            sendApiResponse(
                $ctrl->removeItem((int)$data['id']),
                "Item removed from cart.",
                "Failed to remove item."
            );

        } else {
            http_response_code(400);
            echo json_encode(jsonResponse(false, null, "Invalid action."));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(jsonResponse(false, null, 'Method not allowed'));
        break;
}
