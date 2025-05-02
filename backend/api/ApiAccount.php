<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/AccountController.php");
require_once("../models/response.php"); 

if (!isset($_SESSION['user']['id'])) {
    http_response_code(401);
    echo json_encode(jsonResponse(false, null, 'Unauthorized!'));
    exit;
}

$ctrl   = new AccountController();
$userId = $_SESSION['user']['id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $payload = json_decode(file_get_contents('php://input'), true);

    try {
        if (isset($_GET['update'])) {
            sendApiResponse($ctrl->updateAccount($userId, $payload, $conn), 'Account updated.', 'Update failed.');
        } elseif (isset($_GET['password'])) {
            sendApiResponse($ctrl->changePassword($userId, $payload, $conn), 'Password changed.', 'Password change failed.');
        } elseif (isset($_GET['addPayment'])) {
            sendApiResponse($ctrl->addPayment($userId, $payload, $conn), 'Payment method added.', 'Failed to add payment method.');
        } else {
            http_response_code(400);
            echo json_encode(jsonResponse(false, null, 'Invalid request.'));
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(jsonResponse(false, null, 'Server error.', [$e->getMessage()]));
    }

    exit;
}

http_response_code(405);
echo json_encode(jsonResponse(false, null, 'Method not allowed.'));
