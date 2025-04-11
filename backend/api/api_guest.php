<?php
header("Content-Type: application/json");
session_start();

require_once("../db/dbaccess.php");
require_once("../models/user_class.php");
require_once("../logic/register_logic.php");
require_once("../logic/login_logic.php");
require_once("../controller/user_Controller.php");

$controller = new UserController();

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
}

// === Unbekannte Anfrage ===
http_response_code(405);
echo json_encode(["error" => "Invalid request"]);
