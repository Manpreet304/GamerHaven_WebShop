<?php
// Aktiviert den strikten Typmodus
declare(strict_types=1);

// Gibt an, dass der Server JSON zurückgibt
header("Content-Type: application/json");

// Session starten, falls sie noch nicht läuft
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../logic/AccountLogic.php");
require_once("../models/response.php");

// Zugriffsschutz: Benutzer muss eingeloggt sein
if (!isset($_SESSION['user']['id'])) {
    sendApiResponse(401, null, 'Unauthorized');
}

// Anfrage-Methode (POST, GET, etc.)
$method  = $_SERVER['REQUEST_METHOD'];

// Aktion aus dem Query-String bestimmen (z. B. ?update)
$action  = array_keys($_GET)[0] ?? '';

// User-ID aus der Session ziehen
$userId  = (int)$_SESSION['user']['id'];

// JSON-Nutzdaten aus dem Body laden (z. B. Formulardaten)
$payload = json_decode(file_get_contents('php://input'), true) ?? [];

$logic = new AccountLogic($conn);

try {
    switch ("$method?$action") {
        case 'POST?update':
            // Account-Daten aktualisieren
            sendApiResponse(...$logic->updateAccount($userId, $payload));
            break;

        case 'POST?password':
            // Passwort ändern
            sendApiResponse(...$logic->changePassword($userId, $payload));
            break;

        case 'POST?addPayment':
            // Neue Zahlungsmethode hinzufügen
            sendApiResponse(...$logic->addPaymentMethod($userId, $payload));
            break;

        default:
            // Unerlaubter oder nicht unterstützter Endpunkt
            sendApiResponse(400, null, "Invalid request path");
    }
} catch (Exception $e) {
    // Fehlerprotokollierung und Antwort
    error_log("API error: " . $e->getMessage());
    sendApiResponse(500, null, 'Internal server error');
}
