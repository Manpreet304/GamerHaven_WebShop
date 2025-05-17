<?php
// Gibt an, dass der Server JSON-Daten zurückgibt
header("Content-Type: application/json");

// Startet die Session, falls sie noch nicht läuft
if (session_status() === PHP_SESSION_NONE) session_start();

// DB-Verbindung und Logikklassen einbinden
require_once("../db/dbaccess.php");
require_once("../logic/AdminProductLogic.php");
require_once("../logic/AdminCustomerLogic.php");
require_once("../logic/AdminOrderLogic.php");
require_once("../logic/AdminVoucherLogic.php");
require_once("../models/response.php");

// Zugriffsschutz: Nur Admins erlaubt
if (empty($_SESSION['user']['id']) || $_SESSION['user']['role'] !== 'admin') {
    sendApiResponse(401, null, 'Unauthorized!');
}

// Instanzen der Logic-Klassen erzeugen
$productLogic  = new AdminProductLogic();
$customerLogic = new AdminCustomerLogic();
$orderLogic    = new AdminOrderLogic();
$voucherLogic  = new AdminVoucherLogic();

$method  = $_SERVER['REQUEST_METHOD'];
$action  = array_keys($_GET)[0] ?? '';
$payload = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    switch ("$method?$action") {

        // --- Produkte ---
        case 'GET?listProducts':
            sendApiResponse(...$productLogic->list($conn));
            break;

        case 'GET?getProduct':
            sendApiResponse(...$productLogic->get((int)$_GET['id'], $conn));
            break;

        case 'POST?addProduct':
        case 'POST?updateProduct':
            sendApiResponse(...$productLogic->save($_POST, $_FILES, $conn));
            break;

        case 'POST?deleteProduct':
            sendApiResponse(...$productLogic->delete((int)$_GET['id'], $conn));
            break;

        // --- Kunden ---
        case 'GET?listCustomers':
            sendApiResponse(...$customerLogic->list($conn));
            break;

        case 'GET?getCustomer':
            sendApiResponse(...$customerLogic->get((int)$_GET['id'], $conn));
            break;

        case 'POST?toggleCustomer':
            sendApiResponse(...$customerLogic->toggle((int)$_GET['id'], $conn));
            break;

        case 'POST?addCustomer':
        case 'POST?updateCustomer':
            sendApiResponse(...$customerLogic->save($payload, $conn));
            break;

        case 'POST?deleteCustomer':
            sendApiResponse(...$customerLogic->delete((int)$_GET['id'], $conn));
            break;

        // --- Bestellungen ---
        case 'GET?listOrdersByCustomer':
            $id = (int)($_GET['id'] ?? 0);
            if ($id > 0) {
                sendApiResponse(...$orderLogic->listByCustomer($id, $conn));
            } else {
                sendApiResponse(...$orderLogic->listAll($conn));
            }
            break;

        case 'GET?listOrderItems':
            sendApiResponse(...$orderLogic->listItems((int)$_GET['order_id'], $conn));
            break;

        case 'POST?removeOrderItem':
            sendApiResponse(...$orderLogic->removeItem((int)$_GET['id'], (int)($_GET['qty'] ?? 1), $conn));
            break;

        // --- Gutscheine ---
        case 'GET?listVouchers':
            sendApiResponse(...$voucherLogic->list($conn));
            break;

        case 'GET?getVoucher':
            sendApiResponse(...$voucherLogic->get((int)$_GET['id'], $conn));
            break;

        case 'GET?generateVoucherCode':
            sendApiResponse(...$voucherLogic->generateCode());
            break;

        case 'POST?addVoucher':
        case 'POST?updateVoucher':
            sendApiResponse(...$voucherLogic->save($payload, $conn));
            break;

        // --- Fallback für ungültige Aktionen ---
        default:
            sendApiResponse(400, null, "Invalid request.");
    }

} catch (Exception $e) {
    // Fehlerbehandlung mit Logging
    sendApiResponse(500, ['error' => $e->getMessage()], 'Server error.');
}
