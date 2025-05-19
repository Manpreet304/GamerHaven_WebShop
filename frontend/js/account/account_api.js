(function(window, $) {
  'use strict';

  // AccountAPI: Stellt alle Funktionen rund um das Benutzerkonto bereit
  const AccountAPI = {

    // [1] Aktuelle Benutzerdaten vom Server abrufen
    getAccountData(callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiGuest.php?me',
        method: 'GET',
        onSuccess: data => callbacks.onSuccess?.(data),
        onError: callbacks.onError
      });
    },

    // [2] Zahlungsmethoden laden (aus den Benutzerdaten extrahiert)
    loadPaymentMethods(callbacks = {}) {
      this.getAccountData({
        onSuccess: user => callbacks.onSuccess?.(user.payments || []),
        onError: callbacks.onError
      });
    },

    // [3] Bestellungen des Benutzers laden
    loadOrders(callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiOrder.php?orders',
        method: 'GET',
        onSuccess: data => callbacks.onSuccess?.(data),
        onError: callbacks.onError
      });
    },

    // [4] Details zu einer einzelnen Bestellung abrufen
    getOrderDetails(orderId, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`,
        method: 'GET',
        onSuccess: data => callbacks.onSuccess?.(data),
        onError: callbacks.onError
      });
    },

    // [5] Rechnung zu einer Bestellung herunterladen (neuer Tab)
    downloadInvoice(orderId) {
      window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, '_blank');
    },

    // [6] Kontodaten aktualisieren
    updateAccountInfo(payload, callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiAccount.php?update',
        method: 'POST',
        data: payload,
        successMessage: 'Account updated successfully.',
        onSuccess: callbacks.onSuccess,
        onError: callbacks.onError
      });
    },

    // [7] Neue Zahlungsmethode hinzufügen
    addPaymentMethod(payload, callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiAccount.php?addPayment',
        method: 'POST',
        data: payload,
        successMessage: 'Payment method added.',
        onSuccess: callbacks.onSuccess,
        onError: callbacks.onError
      });
    },

    // [8] Passwort ändern
    changePassword(data, callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiAccount.php?password',
        method: 'POST',
        data: data,
        successMessage: 'Password updated successfully.',
        onSuccess: callbacks.onSuccess,
        onError: callbacks.onError
      });
    }
  };

  // Globale Bereitstellung der API
  window.AccountAPI = AccountAPI;

  // Globale Funktion zum Anzeigen von Bestelldetails
  window.viewOrderDetails = orderId =>
    AccountAPI.getOrderDetails(orderId, {
      onSuccess: data => window.AccountRender.showOrderDetailsModal(data),
      onError: err => handleResponse(err, {
        errorMessage: err?.data?.error || err?.message
      })
    });

  // Globale Funktion zum Herunterladen der Rechnung
  window.downloadInvoice = AccountAPI.downloadInvoice.bind(AccountAPI);

})(window, jQuery);