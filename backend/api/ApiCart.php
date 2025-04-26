<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../db/dbaccess.php';
require_once __DIR__ . '/../controller/CartController.php';

if (empty($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$ctrl   = new CartController();
$userId = $_SESSION['user']['id'];
$response = ["status" => 400, "body" => ["error" => "Invalid request"]];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $response = isset($_GET['cartCount'])
            ? $ctrl->getCartCount($userId)
            : $ctrl->getCartWithSummary($userId);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (isset($_GET['addToCart'])) {
            $pid = (int)$_GET['addToCart'];
            $qty = max(1, (int)($data['quantity'] ?? 1));
            $response = $ctrl->addToCart($userId, $pid, $qty);
        } elseif (!empty($data['action']) && $data['action'] === 'update') {
            $response = $ctrl->updateQuantity((int)$data['id'], (int)$data['quantity']);
        } elseif (!empty($data['action']) && $data['action'] === 'delete') {
            $response = $ctrl->removeItem((int)$data['id']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
}

http_response_code($response['status']);
echo json_encode($response['body']);
