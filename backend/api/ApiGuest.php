<?php
// api/user.php – Verarbeitet Benutzeraktionen wie Login, Logout, Registrierung & Statusabfrage

// Setzt den Header, damit die Antwort als JSON interpretiert wird
header("Content-Type: application/json");

// Session starten, falls noch nicht aktiv
if (session_status() === PHP_SESSION_NONE) session_start();

// Einbindung benötigter Ressourcen
require_once("../db/dbaccess.php");               // Stellt DB-Verbindung her
require_once("../logic/RegisterLogic.php");       // Registrierung
require_once("../logic/LoginLogic.php");          // Login / Token
require_once("../logic/LogoutLogic.php");         // Logout
require_once("../logic/GuestInfoLogic.php");      // Statusprüfung
require_once("../models/UserModel.php");          // Datenmodell
require_once("../models/response.php");           // Enthält Hilfsfunktion sendApiResponse()

// Instanzen der Logik-Klassen
$registerLogic  = new RegisterLogic();
$loginLogic     = new LoginLogic();
$logoutLogic    = new LogoutLogic();
$guestInfoLogic = new GuestInfoLogic();

// Routing basierend auf HTTP-Methode
switch ($_SERVER["REQUEST_METHOD"]) {

    case "GET":
        // Anfrage: User-Status prüfen (eingeloggt oder nicht)
        if (isset($_GET["me"])) {
            sendApiResponse(...$guestInfoLogic->getUserStatus($conn));
        }
        break;

    case "POST":
        // POST-Daten aus dem JSON-Body auslesen
        $data = json_decode(file_get_contents("php://input"), true);

        // Registrierung durchführen
        if (isset($_GET["register"])) {
            $user = new User($data);
            $pw2  = $data["password2"] ?? '';
            sendApiResponse(...$registerLogic->register($user, $pw2, $conn));

        // Login durchführen (optional mit "Remember Me")
        } elseif (isset($_GET["login"])) {
            $remember = $data["remember"] ?? false;
            sendApiResponse(...$loginLogic->login($data, $remember, $conn));

        // Logout durchführen
        } elseif (isset($_GET["logout"])) {
            sendApiResponse(...$logoutLogic->logout($conn));

        // Keine gültige Aktion
        } else {
            sendApiResponse(400, null, "Invalid POST request");
        }
        break;

    default:
        sendApiResponse(405, null, "Method not allowed");
}
