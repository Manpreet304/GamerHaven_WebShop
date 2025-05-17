<?php

/* Sendet eine standardisierte JSON-Antwort für API-Endpunkte.*/
function sendApiResponse(int $status, $data = null, string $message = '', array $errors = []): void {
    // Setzt den HTTP-Statuscode für die Antwort
    http_response_code($status);

    // Gibt die Antwort als JSON an den Client zurück
    echo json_encode([
        'success' => $status >= 200 && $status < 300, // true bei 2xx-Status
        'data'    => $data,
        'message' => $message,
        'errors'  => $errors
    ]);

    // Beendet die weitere Ausführung des Skripts
    exit;
}
