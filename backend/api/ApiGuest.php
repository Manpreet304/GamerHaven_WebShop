<?php
// api/user.php – Verarbeitet Benutzeraktionen wie Login, Logout, Registrierung & Statusabfrage

// Setzt den Header, damit die Antwort als JSON interpretiert wird
header("Content-Type: application/json");

// Session starten, falls noch nicht aktiv
if (session_status() === PHP_SESSION_NONE) session_start();

// Einbindung benötigter Ressourcen
require_once("../db/dbaccess.php");             // Stellt DB-Verbindung her
require_once("../controller/GuestController.php"); // Controller für nicht-authentifizierte Nutzer
require_once("../models/response.php");         // Enthält Hilfsfunktion sendApiResponse()

// Controller-Instanz
$controller = new GuestController($conn);

// Routing basierend auf HTTP-Methode
switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":
        // Anfrage: User-Status prüfen (eingeloggt oder nicht)
        if (isset($_GET["me"])) {
            sendApiResponse(...$controller->getGuestInfo());
        }
        break;

    case "POST":
        // POST-Daten aus dem JSON-Body auslesen
        $data = json_decode(file_get_contents("php://input"), true);

        // Registrierung durchführen
        if (isset($_GET["register"])) {
            sendApiResponse(...$controller->register($data));

        // Login durchführen (optional mit "Remember Me")
        } elseif (isset($_GET["login"])) {
            $remember = $data["remember"] ?? false;
            sendApiResponse(...$controller->login($data, $remember));

        // Logout durchführen
        } elseif (isset($_GET["logout"])) {
            sendApiResponse(...$controller->logout());

        // Keine gültige Aktion
        } else {
            sendApiResponse(400, null, "Invalid POST request");
        }
        break;

    default:
        // Methode nicht erlaubt (z. B. PUT/DELETE)
        sendApiResponse(405, null, "Method not allowed");
}
