<?php
// api/order.php

// Setzt den HTTP-Header auf JSON-Ausgabe
header("Content-Type: application/json");

// Startet die Session, falls noch nicht aktiv
if (session_status() === PHP_SESSION_NONE) session_start();

// Lädt benötigte Ressourcen
require_once("../db/dbaccess.php");           // Datenbankverbindung
require_once("../controller/OrderController.php"); // Order-Logik via Controller
require_once("../models/response.php");       // Einheitliche Antwortfunktion

// Prüft, ob ein Benutzer eingeloggt ist (Session enthält User-ID)
if (!isset($_SESSION["user"]["id"])) {
    sendApiResponse(401, null, "Unauthorized!"); // Abbruch bei fehlender Authentifizierung
}

// User-ID für alle Aktionen verfügbar machen
$userId = $_SESSION["user"]["id"];

// Controller-Instanz zur Weitergabe der Logik
$orderController = new OrderController($conn);

// Unterscheidung nach HTTP-Methode
switch ($_SERVER["REQUEST_METHOD"]) {
    case "POST":
        // Neue Bestellung anlegen
        $data = json_decode(file_get_contents("php://input"), true); // JSON Body parsen

        // Bestellung über Controller abwickeln
        sendApiResponse(
            ...$orderController->placeOrder(
                $userId,
                (int)$data["payment_id"],           // Zahlung
                $data["voucher"] ?? null            // Optionaler Gutschein
            )
        );
        break;

    case "GET":
        // Alle Bestellungen für eingeloggten Benutzer abrufen
        if (isset($_GET["orders"])) {
            sendApiResponse(...$orderController->getOrders($userId));
            break;
        }

        // Details zu einer bestimmten Bestellung (nur falls orderId vorhanden)
        if (isset($_GET["orderDetails"]) && isset($_GET["orderId"])) {
            $orderId = (int)$_GET["orderId"];
            sendApiResponse(...$orderController->getOrderDetails($orderId, $userId));
            break;
        }

        // Wenn kein passender Parameter gefunden wurde
        sendApiResponse(400, null, "Missing parameter.");
        break;

    default:
        // HTTP-Methode nicht erlaubt
        sendApiResponse(405, null, "Method not allowed.");
        break;
}
