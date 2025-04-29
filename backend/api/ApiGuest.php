<?php
header("Content-Type: application/json");
if (session_status() === PHP_SESSION_NONE) session_start();

require_once __DIR__ . '/../db/dbaccess.php';
require_once __DIR__ . '/../controller/UserController.php';

$controller = new UserController();

switch ($_SERVER["REQUEST_METHOD"]) {
    case "GET":
        if (isset($_GET["me"])) {
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

            // Nutzerdetails
            $stmt = $conn->prepare("
                SELECT firstname AS first_name, lastname AS last_name, email, address, zip_code, city, country
                FROM users WHERE id = ?
            ");
            $stmt->bind_param("i", $userId);
            $stmt->execute();
            $userData = $stmt->get_result()->fetch_assoc();

            // Zahlungsmethoden
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

            echo json_encode(array_merge([
                "loggedIn"   => true,
                "username"   => $user["username"],
                "role"       => $user["role"],
                "payment_id" => $user["payment_id"] ?? null,
                "payments"   => $payments
            ], $userData));
            exit;
        }
        break;

    case "POST":
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
                "status" => 400,
                "body" => ["error" => "Invalid POST request"]
            ];
        }

        http_response_code($response["status"]);
        echo json_encode($response["body"]);
        exit;
}

http_response_code(405);
echo json_encode(value: ["error" => "Method not allowed"]);
