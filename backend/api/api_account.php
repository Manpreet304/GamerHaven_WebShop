<?php
header("Content-Type: application/json");

if (session_status() === PHP_SESSION_NONE) session_start();

require_once("../db/dbaccess.php");
require_once("../controller/account_controller.php");

if (!isset($_SESSION["user"])) {
    http_response_code(401);
    echo json_encode(["success" => false, "error" => "Unauthorized"]);
    exit;
}

$accountController = new AccountController();

$userId = $_SESSION["user"]["id"];
$data = json_decode(file_get_contents("php://input"), true);

$response = $accountController->updateAccount($userId, $data, $conn);
http_response_code($response["status"]);
echo json_encode($response["body"]);
