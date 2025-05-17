<?php
// Strikte Typisierung aktivieren
declare(strict_types=1);

// Gibt an, dass der Server JSON-Daten zurückgibt
header("Content-Type: application/json");

// Session starten, falls noch nicht aktiv
if (session_status() === PHP_SESSION_NONE) session_start();

// Erforderliche Dateien einbinden: DB-Verbindung, Controller, Response-Helper
require_once("../db/dbaccess.php");
require_once("../controller/AccountController.php");
require_once("../models/response.php");

// Prüfen, ob der Benutzer eingeloggt ist
if (!isset($_SESSION['user']['id'])) {
    sendApiResponse(401, null, 'Unauthorized');
}

// Anfrage-Methode und Aktion (GET-Parameter-Schlüssel)
$method   = $_SERVER['REQUEST_METHOD'];
$action   = array_keys($_GET)[0] ?? '';

// User-ID aus der Session extrahieren
$userId   = (int)$_SESSION['user']['id'];

// Nutzlast aus dem Request-Body einlesen (JSON), oder leeres Array als Fallback
$payload  = json_decode(file_get_contents('php://input'), true) ?? [];

// Controller-Instanz erzeugen
$ctrl = new AccountController($conn);

try {
    // Anfrage-Routing basierend auf Methode und Query-Key
    switch ("$method?$action") {
        case 'POST?update':
            // Account-Daten aktualisieren
            sendApiResponse(...$ctrl->updateAccount($userId, $payload));
            break;

        case 'POST?password':
            // Passwort ändern
            sendApiResponse(...$ctrl->changePassword($userId, $payload));
            break;

        case 'POST?addPayment':
            // Neue Zahlungsmethode hinzufügen
            sendApiResponse(...$ctrl->addPayment($userId, $payload));
            break;

        default:
            // Ungültiger Endpunkt
            sendApiResponse(400, null, "Invalid request path");
    }
} catch (Exception $e) {
    // Fehler-Logging & Fehlerantwort
    error_log("API error: " . $e->getMessage());
    sendApiResponse(500, null, 'Internal server error');
}
