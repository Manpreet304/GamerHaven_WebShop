<?php
/**
 * Die User-Klasse repräsentiert einen Benutzer mit Stammdaten und Zahlungsinformationen.
 */
class User {
    // Allgemeine Benutzerdaten
    public $salutation;         // Anrede (z.B. Herr, Frau)
    public $first_name;         // Vorname
    public $last_name;          // Nachname
    public $address;            // Adresse (Straße + Hausnummer)
    public $zip;                // Postleitzahl
    public $city;               // Stadt
    public $email;              // E-Mail-Adresse
    public $username;          // Benutzername (Login)
    public $password;           // Passwort im Klartext (Hash erfolgt später)
    public $country;            // Land

    // Zahlungsinformationen (optional, abhängig von Zahlungsmethode)
    public $payment_method;     // Zahlungsmethode (z.B. 'Credit Card', 'PayPal', 'Bank Transfer')
    public $card_number;        // Kreditkartennummer (nur temporär, wird nicht gespeichert)
    public $csv;                // Sicherheitscode der Karte
    public $paypal_email;       // PayPal E-Mail
    public $paypal_username;    // PayPal Benutzername
    public $iban;               // IBAN für Banküberweisung
    public $bic;                // BIC für Banküberweisung

    /**
     * Konstruktor: Initialisiert alle vorhandenen Properties aus einem assoziativen Array.
     * Überschüssige Keys im Array werden ignoriert.
     *
     * @param array $data Eingabedaten vom Frontend (z.B. $_POST)
     */
    public function __construct(array $data) {
        foreach ($data as $key => $value) {
            // Setzt nur Werte, wenn die Property im Objekt definiert ist
            if (property_exists($this, $key)) {
                // Entfernt überflüssige Leerzeichen bei Strings
                $this->$key = is_string($value) ? trim($value) : $value;
            }
        }
    }
}
