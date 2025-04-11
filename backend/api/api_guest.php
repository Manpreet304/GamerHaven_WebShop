<?php
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once("../db/dbaccess.php");
require_once("../models/user_class.php");
require_once("../logic/register_logic.php");
require_once("../logic/login_logic.php");
require_once("../controller/user_Controller.php");
require_once("../logic/logout_logic.php");

$controller = new UserController();

// === Loginstatus prüfen (z. B. für Navbar) ===
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["me"])) {
    if (isset($_SESSION["user"])) {
        echo json_encode([
            "loggedIn" => true,
            "username" => $_SESSION["user"]["username"],
            "role" => $_SESSION["user"]["role"]
        ]);
    } else {
        echo json_encode(["loggedIn" => false]);
    }
    exit;
}

// === POST-Anfragen ===
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    // === Registrierung ===
    if (isset($_GET["register"])) {
        $response = $controller->register($data);
        http_response_code($response["status"]);
        echo json_encode($response["body"]);
        exit;
    }

    // === Login ===
    if (isset($_GET["login"])) {
        $remember = $data["remember"] ?? false;
        $response = $controller->login($data, $remember);
        http_response_code($response["status"]);
        echo json_encode($response["body"]);
        exit;
    }

    // === Logout ===
   // === Logout ===
    if (isset($_GET["logout"])) {
        $response = $controller->logout();
        http_response_code($response["status"]);
        echo json_encode($response["body"]);
        exit;
    }
}

// === Unbekannte Anfrage ===
http_response_code(405);
echo json_encode(["error" => "Invalid request"]);
