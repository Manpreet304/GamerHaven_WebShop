<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

// adjust these paths to your structure:
require_once __DIR__ . '/../db/dbaccess.php';
require_once __DIR__ . '/../controller/account_controller.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

$controller = new AccountController();
$userId     = $_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);

    if (isset($_GET['password'])) {
        $response = $controller->changePassword($userId, $payload, $conn);
    } elseif (isset($_GET['update'])) {
        $response = $controller->updateAccount($userId, $payload, $conn);
    } else {
        $response = ['status' => 400, 'body' => ['error' => 'Invalid request']];
    }

    http_response_code($response['status']);
    echo json_encode($response['body']);
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
