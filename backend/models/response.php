<?php

/* 
 * Sendet eine standardisierte JSON-Antwort für API-Endpunkte.
 * Wird verwendet, um konsistente HTTP-Antworten im JSON-Format auszugeben.
 */
function sendApiResponse(int $status, $data = null, string $message = '', array $errors = []): void {
    // Setzt den HTTP-Statuscode der Antwort (z. B. 200, 400, 500)
    http_response_code($status);

    // Gibt ein JSON-Objekt mit Erfolg, Daten, Nachricht und Fehlern aus
    echo json_encode([
        'success' => $status >= 200 && $status < 300, // Erfolg bei HTTP-Status 2xx
        'data'    => $data,                           // Ergebnisdaten (optional)
        'message' => $message,                        // Status- oder Fehlermeldung
        'errors'  => $errors                          // Validierungs- oder andere Fehlerdetails
    ]);

    // Beendet die weitere Skriptausführung
    exit;
}
