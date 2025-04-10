<?php
header("Content-Type: application/json");
session_start();

require_once("../db/dbaccess.php");
require_once("../models/user_class.php");
require_once("../logic/register_logic.php");
require_once("../logic/login_logic.php");

// === Registrierung ===
if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["register"])) {
    $data = json_decode(file_get_contents("php://input"), true);

    $user = new User($data);
    $registerLogic = new RegisterLogic();

    $validation = $registerLogic->validate($user, $data["password2"], $conn);
    if ($validation !== true) {
        http_response_code(400);
        echo json_encode(["error" => $validation]);
        exit;
    }

    if ($registerLogic->save($user, $conn)) {
        http_response_code(201);
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error saving user: " . mysqli_error($conn)]);
    }
}

// === Login ===
elseif ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["login"])) {
    $data = json_decode(file_get_contents("php://input"), true);
    $remember = $data["remember"] ?? false;

    $loginLogic = new LoginLogic();
    $result = $loginLogic->login($data, $conn);

    if (is_string($result)) {
        http_response_code(400);
        echo json_encode(["error" => $result]);
        exit;
    }

    if ($remember) {
        $token = bin2hex(random_bytes(16));
        setcookie("remember_token", $token, time() + 60 * 60 * 24 * 30, "/");
        $loginLogic->saveRememberToken($result["id"], $token, $conn);
    }

    echo json_encode(["success" => true]);
}

// === Unbekannte Anfrage ===
else {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request"]);
}
