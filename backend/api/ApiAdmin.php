<?php
// Gibt an, dass der Server JSON-Daten zurückgibt
header("Content-Type: application/json");

// Startet die Session, falls sie noch nicht läuft
if (session_status() === PHP_SESSION_NONE) session_start();

// Bindet benötigte Dateien ein
require_once("../db/dbaccess.php");           // DB-Verbindung
require_once("../controller/AdminController.php"); // Logik für Admin-Aktionen
require_once("../models/response.php");       // sendApiResponse()

// Prüft, ob Benutzer eingeloggt ist und Admin-Rechte hat
if (empty($_SESSION['user']['id']) || $_SESSION['user']['role'] !== 'admin') {
    sendApiResponse(401, null, 'Unauthorized!');
}

// Instanziiert den Controller
$ctrl = new AdminController($conn);

// Ermittelt Methode (GET/POST) und erste GET-Aktion (?key=...)
$method  = $_SERVER['REQUEST_METHOD'];
$action  = array_keys($_GET)[0] ?? '';

// Nimmt JSON-Body-Daten oder Fallback auf $_POST
$payload = json_decode(file_get_contents('php://input'), true) ?? $_POST;

try {
    // Kombiniert Methode und Aktion zu einem String (z. B. "GET?listProducts")
    switch ("$method?$action") {

        // --- Produkte ---
        case 'GET?listProducts':
            sendApiResponse(...$ctrl->listProducts());
            break;

        case 'GET?getProduct':
            sendApiResponse(...$ctrl->getProduct((int)$_GET['id']));
            break;

        case 'POST?addProduct':
        case 'POST?updateProduct':
            sendApiResponse(...$ctrl->saveProduct($_POST, $_FILES));
            break;

        case 'POST?deleteProduct':
            sendApiResponse(...$ctrl->deleteProduct((int)$_GET['id']));
            break;

        // --- Kunden ---
        case 'GET?listCustomers':
            sendApiResponse(...$ctrl->listCustomers());
            break;

        case 'GET?getCustomer':
            sendApiResponse(...$ctrl->getCustomer((int)$_GET['id']));
            break;

        case 'POST?toggleCustomer':
            sendApiResponse(...$ctrl->toggleCustomer((int)$_GET['id']));
            break;

        case 'POST?addCustomer':
        case 'POST?updateCustomer':
            sendApiResponse(...$ctrl->saveCustomer($payload));
            break;

        case 'POST?deleteCustomer':
            sendApiResponse(...$ctrl->deleteCustomer((int)$_GET['id']));
            break;

        // --- Bestellungen ---
        case 'GET?listOrdersByCustomer':
            $id = (int)($_GET['id'] ?? 0);
            if ($id > 0) {
                sendApiResponse(...$ctrl->listOrdersByCustomer($id));
            } else {
                sendApiResponse(...$ctrl->listAllOrders());
            }
            break;

        case 'GET?listOrderItems':
            sendApiResponse(...$ctrl->listOrderItems((int)$_GET['order_id']));
            break;

        case 'POST?removeOrderItem':
            sendApiResponse(...$ctrl->removeOrderItem((int)$_GET['id'], (int)($_GET['qty'] ?? 1)));
            break;

        // --- Gutscheine ---
        case 'GET?listVouchers':
            sendApiResponse(...$ctrl->listVouchers());
            break;

        case 'GET?getVoucher':
            sendApiResponse(...$ctrl->getVoucher((int)$_GET['id']));
            break;

        case 'GET?generateVoucherCode':
            sendApiResponse(...$ctrl->getNewVoucherCode());
            break;

        case 'POST?addVoucher':
        case 'POST?updateVoucher':
            sendApiResponse(...$ctrl->saveVoucher($payload));
            break;

        // --- Fallback: ungültige Route ---
        default:
            sendApiResponse(400, null, "Invalid request.");
    }

// Fehlerbehandlung: Fangt alle unerwarteten Exceptions ab
} catch (Exception $e) {
    sendApiResponse(500, ['error' => $e->getMessage()], 'Server error.');
}
