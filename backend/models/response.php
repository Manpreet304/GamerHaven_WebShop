<?php
// models/response.php

function jsonResponse(bool $success, $data = null, string $message = '', array $errors = []): array {
    return [
        "success" => $success,
        "data"    => $data,
        "message" => $message,
        "errors"  => $errors
    ];
}

function sendApiResponse(array $controllerResponse, string $messageIfSuccess = "OK", string $messageIfError = "An error occurred"): void {
    http_response_code($controllerResponse["status"]);

    echo json_encode(jsonResponse(
        $controllerResponse["status"] === 200,
        $controllerResponse["body"] ?? null,
        $controllerResponse["status"] === 200 ? $messageIfSuccess : $messageIfError,
        $controllerResponse["body"]["errors"] ?? []
    ));
    exit;
}
