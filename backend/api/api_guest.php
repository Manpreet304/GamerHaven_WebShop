<?php
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once("../db/dbaccess.php");
require_once("../models/user_class.php");
require_once("../logic/register_logic.php");
require_once("../logic/login_logic.php");
require_once("../controller/user_controller.php");
require_once("../logic/logout_logic.php");

$controller = new UserController();

// === GET-Anfragen: Nutzer-Status abrufen ===
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["me"])) {
    echo json_encode([
        "loggedIn" => isset($_SESSION["user"]),
        "username" => $_SESSION["user"]["username"] ?? null,
        "role"     => $_SESSION["user"]["role"]     ?? null
    ]);
    exit;
}

// === POST-Anfragen: login, register, logout ===
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    if (isset($_GET["register"])) {
        $response = $controller->register($data);
    } elseif (isset($_GET["login"])) {
        $remember = $data["remember"] ?? false;
        $response = $controller->login($data, $remember);
    } elseif (isset($_GET["logout"])) {
        $response = $controller->logout();
    } else {
        $response = [
            "status" => 405,
            "body" => ["errors" => ["general" => "Invalid action."]]
        ];
    }

    http_response_code($response["status"]);
    echo json_encode($response["body"]);
    exit;
}

// Fallback für andere Methoden
http_response_code(405);
echo json_encode(["errors" => ["general" => "Invalid request method."]]);
