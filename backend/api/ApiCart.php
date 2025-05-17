<?php
// Gibt an, dass die Antwort im JSON-Format erfolgt
header("Content-Type: application/json");

// Startet die Session, falls sie noch nicht aktiv ist
if (session_status() === PHP_SESSION_NONE) session_start();

// Bindet notwendige Abhängigkeiten ein
require_once __DIR__ . '/../db/dbaccess.php';        // Stellt DB-Verbindung her
require_once __DIR__ . '/../controller/CartController.php'; // Controller für Warenkorb-Funktionen
require_once __DIR__ . '/../models/response.php';    // sendApiResponse() Funktion

// Prüft, ob der Benutzer eingeloggt ist – andernfalls Abbruch
if (empty($_SESSION['user']['id'])) {
    sendApiResponse(401, null, 'Please log in to add items to your cart!');
}

// Erstellt Controller-Instanz + speichert User-ID
$ctrl   = new CartController($conn);
$userId = $_SESSION['user']['id'];

// Steuert Verhalten anhand der HTTP-Methode
switch ($_SERVER['REQUEST_METHOD']) {

    case 'GET':
        // Bei ?cartCount wird nur die Menge zurückgegeben
        if (isset($_GET['cartCount'])) {
            [$status, $data, $msg] = $ctrl->getCartCount($userId);
            sendApiResponse($status, $data, $msg);
        } else {
            // Sonst: Komplette Cart-Daten + Summen
            [$status, $data, $msg] = $ctrl->getCartWithSummary($userId);
            sendApiResponse($status, $data, $msg);
        }
        break;

    case 'POST':
        // Liest JSON-Daten aus dem Request-Body
        $data = json_decode(file_get_contents('php://input'), true);

        // Produkt in den Warenkorb legen (per URL-Query)
        if (isset($_GET['addToCart'])) {
            $pid = (int)$_GET['addToCart'];
            $qty = max(1, (int)($data['quantity'] ?? 1)); // Mindestmenge 1
            [$status, $data, $msg] = $ctrl->addToCart($userId, $pid, $qty);
            sendApiResponse($status, $data, $msg);

        // Menge eines Artikels im Warenkorb ändern
        } elseif (!empty($data['action']) && $data['action'] === 'update') {
            [$status, $data, $msg] = $ctrl->updateQuantity((int)$data['id'], (int)$data['quantity']);
            sendApiResponse($status, $data, $msg);

        // Artikel aus dem Warenkorb entfernen
        } elseif (!empty($data['action']) && $data['action'] === 'delete') {
            [$status, $data, $msg] = $ctrl->removeItem((int)$data['id']);
            sendApiResponse($status, $data, $msg);

        // Keine bekannte Aktion
        } else {
            sendApiResponse(400, null, "Invalid action.");
        }
        break;

    // Andere Methoden (z. B. PUT/DELETE) sind nicht erlaubt
    default:
        sendApiResponse(405, null, 'Method not allowed');
        break;
}
