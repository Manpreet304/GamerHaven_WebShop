<?php
header("Content-Type: application/json");
session_start();
require_once ("../db/dbaccess.php");
require_once ("../models/user_class.php");
require_once ("../logic/user_service.php");

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_GET["register"])) {
    $data = json_decode(file_get_contents("php://input"), true);

    $user = new User($data);
    $service = new UserService();

    $validation = $service->validate($user, $data["password2"]);
    if ($validation !== true) {
        http_response_code(400);
        echo json_encode(["error" => $validation]);
        exit;
    }

    if ($service->save($user, $conn)) {
        http_response_code(201);
        echo json_encode(["success" => true]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error saving user: " . mysqli_error($conn)]);
    }
} else {
    http_response_code(405);
    echo json_encode(["error" => "Invalid request"]);
}
