(function(window, $) {
  'use strict';

  const AccountAPI = {
    // Nutzerdaten laden
    getAccountData(callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiGuest.php?me',
        method: 'GET',
        onSuccess: res => callbacks.onSuccess?.(res.data),
        onError: callbacks.onError
      });
    },

    // Zahlmethoden extrahieren (aus Nutzerdaten)
    loadPaymentMethods(callbacks = {}) {
      this.getAccountData({
        onSuccess: user => callbacks.onSuccess?.(user.payments || []),
        onError: callbacks.onError
      });
    },

    // Bestellübersicht laden
    loadOrders(callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiOrder.php?orders',
        method: 'GET',
        onSuccess: res => callbacks.onSuccess?.(res.data),
        onError: callbacks.onError
      });
    },

    // Einzelne Bestelldetails abrufen
    getOrderDetails(orderId, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`,
        method: 'GET',
        onSuccess: res => callbacks.onSuccess?.(res.data),
        onError: callbacks.onError
      });
    },

    // Rechnung downloaden
    downloadInvoice(orderId) {
      window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, '_blank');
    },

    // Account-Daten speichern
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

    // Neue Zahlmethode speichern
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

    // Passwort ändern
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

  // Globale Bereitstellung
  window.AccountAPI = AccountAPI;

  // Direktfunktionen für Buttons etc.
  window.viewOrderDetails = orderId =>
    AccountAPI.getOrderDetails(orderId, {
      onSuccess: data => window.AccountRender.showOrderDetailsModal(data),
      onError: err => handleResponse(err, {
        errorMessage: err?.data?.error || err?.message
      })
    });

  window.downloadInvoice = AccountAPI.downloadInvoice.bind(AccountAPI);

})(window, jQuery);