<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/UserController.php");
require_once("../models/response.php"); // zentrale jsonResponse + sendApiResponse

$controller = new UserController();

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        if (isset($_GET["me"])) {
            if (!isset($_SESSION["user"])) {
                sendApiResponse([
                    "status" => 200,
                    "body" => [
                        "loggedIn" => false,
                        "username" => null,
                        "role"     => null,
                        "payments" => []
                    ]
                ], "Not logged in.");
            }

            $user   = $_SESSION["user"];
            $userId = $user["id"];

            // Nutzer-Daten
            $stmt = $conn->prepare("
                SELECT firstname AS first_name, lastname AS last_name, email, address, zip_code, city, country
                FROM users WHERE id = ?
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $userData = $stmt->get_result()->fetch_assoc();

            // Zahlungen
            $stmt = $conn->prepare("
                SELECT id, method, RIGHT(card_number, 4) AS last_digits, paypal_email, iban
                FROM payments WHERE user_id = ?
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $result = $stmt->get_result();

            $payments = [];
            while ($row = $result->fetch_assoc()) {
                $payments[] = $row;
            }

            $data = array_merge([
                "loggedIn"   => true,
                "username"   => $user["username"],
                "role"       => $user["role"],
                "payment_id" => $user["payment_id"] ?? null,
                "payments"   => $payments
            ], $userData);

            sendApiResponse([
                "status" => 200,
                "body" => $data
            ], "User data loaded.");
        }
        break;

    case "POST":
        $data = json_decode(file_get_contents("php://input"), true);

        if (isset($_GET["register"])) {
            sendApiResponse($controller->register($data), "Registration successful.", "Registration failed.");
        } elseif (isset($_GET["login"])) {
            $remember = $data["remember"] ?? false;
            sendApiResponse($controller->login($data, $remember), "Login successful.", "Login failed.");
        } elseif (isset($_GET["logout"])) {
            sendApiResponse($controller->logout(), "Logged out.");
        } else {
            http_response_code(400);
            echo json_encode(jsonResponse(false, null, "Invalid POST request"));
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(jsonResponse(false, null, "Method not allowed"));
}
