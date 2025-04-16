<?php
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once("../db/dbaccess.php");
require_once("../models/user_class.php");
require_once("../logic/register_logic.php");
require_once("../logic/login_logic.php");
require_once("../logic/logout_logic.php");
require_once("../controller/user_controller.php");

$controller = new UserController();

// === GET-Anfragen: Nutzerstatus & Zahlungsmethoden ===
if ($_SERVER["REQUEST_METHOD"] === "GET" && isset($_GET["me"])) {
    if (!isset($_SESSION["user"])) {
        echo json_encode([
            "loggedIn" => false,
            "username" => null,
            "role" => null,
            "payments" => []
        ]);
        exit;
    }

    $user = $_SESSION["user"];
    $userId = $user["id"];

    // Zahlungsmethoden abrufen
    $stmt = $conn->prepare("
    SELECT id, method, 
           RIGHT(card_number, 4) AS last_digits,
           paypal_email, iban
    FROM payments
    WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    $payments = [];
    while ($row = $result->fetch_assoc()) {
        $payments[] = $row;
    }

    echo json_encode([
        "loggedIn" => true,
        "username" => $user["username"],
        "role"     => $user["role"],
        "payment_id" => $user["payment_id"] ?? null, // optional, falls du es brauchst
        "payments" => $payments
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
