<?php
class GuestInfoLogic {

  // Gibt eingeloggte Userdaten sowie gespeicherte Zahlungsmethoden zurück
  public function getUserStatus(mysqli $conn): array {
    // Automatischer Login über "Remember Me"-Token, falls keine aktive Session vorhanden ist
    if (!isset($_SESSION["user"]) && isset($_COOKIE["remember_token"])) {
      require_once("../logic/LoginLogic.php");
      $loginLogic = new LoginLogic();
      [$status, $userData, $msg] = $loginLogic->loginWithToken($_COOKIE["remember_token"], $conn);

      if ($status === 200) {
        $_SESSION["user"] = $userData;
        // Verlängert die Gültigkeit des Tokens im Cookie
        setcookie("remember_token", $_COOKIE["remember_token"], time() + 60 * 60 * 24 * 30, "/");
      }
    }

    // Wenn keine Session vorhanden ist, gilt der Benutzer als nicht eingeloggt
    if (!isset($_SESSION["user"])) {
      return [200, [
        "loggedIn" => false,
        "username" => null,
        "role"     => null,
        "payments" => []
      ], "Not logged in"];
    }

    $userId = $_SESSION["user"]["id"];

    // Benutzerstammdaten aus der Datenbank laden
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

    // Zahlungsdaten (z. B. Kreditkarte, PayPal, IBAN) abrufen
    $stmt = $conn->prepare("SELECT id, method, RIGHT(card_number, 4) AS last_digits,
                                  paypal_email, iban
                           FROM payments
                           WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $payments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Benutzer- und Zahlungsdaten zusammenführen
    $data = array_merge([
      "loggedIn" => true,
      "role"     => $_SESSION["user"]["role"],
      "payments" => $payments
    ], $userData);

    return [200, $data, "User data loaded"];
  }
}
