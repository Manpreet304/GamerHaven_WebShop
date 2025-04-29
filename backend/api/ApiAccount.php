<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../db/dbaccess.php';
require_once __DIR__ . '/../controller/AccountController.php';

if (!isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(['success'=>false,'error'=>'Unauthorized!']);
    exit;
}

$ctrl   = new AccountController();
$userId = $_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);

    if (isset($_GET['update'])) {
        $response = $ctrl->updateAccount($userId, $payload, $conn);
    }
    elseif (isset($_GET['password'])) {
        $response = $ctrl->changePassword($userId, $payload, $conn);
    }
    elseif (isset($_GET['addPayment'])) {
        $response = $ctrl->addPayment($userId, $payload, $conn);
    }
    else {
        $response = ['status'=>400,'body'=>['error'=>'Invalid request']];
    }

    http_response_code($response['status']);
    echo json_encode($response['body']);
    exit;
}

http_response_code(405);
echo json_encode(['error'=>'Method not allowed']);
