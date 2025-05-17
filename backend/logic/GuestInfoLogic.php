<?php
class GuestInfoLogic {

  // Gibt eingeloggte Userdaten + gespeicherte Zahlungsmethoden zurück
  public function getUserStatus(mysqli $conn): array {
    if (!isset($_SESSION["user"])) {
      return [200, [
        "loggedIn" => false,
        "username" => null,
        "role"     => null,
        "payments" => []
      ], "Not logged in"];
    }

    $userId = $_SESSION["user"]["id"];

    // Userdaten abrufen
    $stmt = $conn->prepare("SELECT username, firstname AS first_name, lastname AS last_name,
                                   email, address, zip_code, city, country
                            FROM users
                            WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $userData = $stmt->get_result()->fetch_assoc();

    if (!$userData) {
      return [404, null, "User not found"];
    }

    // Zahlungsdaten abrufen
    $stmt = $conn->prepare("SELECT id, method, RIGHT(card_number, 4) AS last_digits,
                                  paypal_email, iban
                           FROM payments
                           WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $payments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Daten zusammenführen und zurückgeben
    $data = array_merge([
      "loggedIn" => true,
      "role"     => $_SESSION["user"]["role"],
      "payments" => $payments
    ], $userData);

    return [200, $data, "User data loaded"];
  }
}