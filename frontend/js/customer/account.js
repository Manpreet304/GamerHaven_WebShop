$(document).ready(function () {
  initAccountInfo();        // Account-Daten laden
  initAccountPayments();    // Zahlungsarten laden
  initAccountOrders();      // Bestellungen laden
  initAccountPassword();    // Passwort-Verwaltung laden
  bindAccountUIEvents();    // Button- und Form-Events binden
});
