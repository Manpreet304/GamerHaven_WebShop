<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/AdminController.php");
require_once("../models/response.php"); // <- zentrale Hilfen

if (empty($_SESSION['user']['id']) || $_SESSION['user']['role'] !== 'admin') {
    http_response_code(401);
    echo json_encode(jsonResponse(false, null, 'Unauthorized!'));
    exit;
}

$ctrl = new AdminController();
$conn = $GLOBALS['conn'];
$qs   = array_keys($_GET)[0] ?? '';

try {
    $method = $_SERVER['REQUEST_METHOD'].'?'.$qs;

    switch ($method) {
        // ----- PRODUCTS -----
        case 'GET?listProducts':
            sendApiResponse($ctrl->listProducts($conn), "Product list loaded.");
        case 'GET?getProduct':
            sendApiResponse($ctrl->getProduct((int)$_GET['id'], $conn), "Product loaded.");
        case 'POST?addProduct':
        case 'POST?updateProduct':
            sendApiResponse($ctrl->saveProduct($_POST, $_FILES, $conn), "Product saved.");
        case 'POST?deleteProduct':
            sendApiResponse($ctrl->deleteProduct((int)$_GET['id'], $conn), "Product deleted.");

        // ----- CUSTOMERS -----
        case 'GET?listCustomers':
            sendApiResponse($ctrl->listCustomers($conn), "Customer list loaded.");
        case 'GET?getCustomer':
            sendApiResponse($ctrl->getCustomer((int)$_GET['id'], $conn), "Customer loaded.");
        case 'POST?toggleCustomer':
            sendApiResponse($ctrl->toggleCustomer((int)$_GET['id'], $conn), "Customer toggled.");
        case 'POST?addCustomer':
        case 'POST?updateCustomer':
            $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
            sendApiResponse($ctrl->saveCustomer($data, $conn), "Customer saved.");
        case 'POST?deleteCustomer':
            sendApiResponse($ctrl->deleteCustomer((int)$_GET['id'], $conn), "Customer deleted.");

        // ----- ORDERS -----
        case 'GET?listOrdersByCustomer':
            sendApiResponse($ctrl->listOrdersByCustomer((int)$_GET['id'], $conn), "Orders loaded.");
        case 'GET?listOrderItems':
            sendApiResponse($ctrl->listOrderItems((int)$_GET['order_id'], $conn), "Order items loaded.");
        case 'POST?removeOrderItem':
            sendApiResponse(
                $ctrl->removeOrderItem((int)$_GET['id'], (int)($_GET['qty'] ?? 1), $conn),
                "Order item removed."
            );

        // ----- VOUCHERS -----
        case 'GET?listVouchers':
            sendApiResponse($ctrl->listVouchers($conn), "Vouchers loaded.");
        case 'GET?getVoucher':
            sendApiResponse($ctrl->getVoucher((int)$_GET['id'], $conn), "Voucher loaded.");
        case 'GET?generateVoucherCode':
            sendApiResponse($ctrl->getNewVoucherCode(), "Voucher code generated.");
        case 'POST?addVoucher':
        case 'POST?updateVoucher':
            $data = json_decode(file_get_contents('php://input'), true);
            sendApiResponse($ctrl->saveVoucher($data, $conn), "Voucher saved.");

        default:
            http_response_code(400);
            echo json_encode(jsonResponse(false, null, "Invalid request."));
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(jsonResponse(false, null, "Server error.", [$e->getMessage()]));
}
