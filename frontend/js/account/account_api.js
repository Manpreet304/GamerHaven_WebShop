/**
 * js/account/account_api.js
 * Verantwortlich für API-Aufrufe rund um Account, Zahlungen und Bestellungen
 */
(function(window, $) {
  'use strict';

  const AccountAPI = {
    // Basis-Userdaten laden
    getAccountData(callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiGuest.php?me',
        method: 'GET',
        onSuccess: res => callbacks.onSuccess?.(res.data),
        onError: err  => callbacks.onError?.(err)
      });
    },

    // Zahlungsmethoden des Nutzers laden
    loadPaymentMethods(callbacks = {}) {
      this.getAccountData({
        onSuccess: user => callbacks.onSuccess?.(user.payments || []),
        onError:   callbacks.onError
      });
    },

    // Bestellübersicht laden
    loadOrders(callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiOrder.php?orders',
        method: 'GET',
        onSuccess: res => callbacks.onSuccess?.(res.data.body || []),
        onError:   err => callbacks.onError?.(err)
      });
    },

    // Details zu einer Bestellung laden
    getOrderDetails(orderId, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`,
        method: 'GET',
        onSuccess: res => callbacks.onSuccess?.(res.data),
        onError:   err => callbacks.onError?.(err)
      });
    },

    // Rechnung herunterladen
    downloadInvoice(orderId) {
      window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, '_blank');
    },

    // Kontodaten aktualisieren
    updateAccountInfo(payload, callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiAccount.php?update',
        method: 'POST',
        data: payload,
        successMessage: 'Account updated successfully.',
        onSuccess: res => callbacks.onSuccess?.(res),
        onError:  err => callbacks.onError?.(err)
      });
    },

    // Neue Zahlungsmethode hinzufügen
    addPaymentMethod(payload, callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiAccount.php?addPayment',
        method: 'POST',
        data: payload,
        successMessage: 'Payment method added.',
        onSuccess: res => callbacks.onSuccess?.(res),
        onError:  err => callbacks.onError?.(err)
      });
    },

    // Passwort ändern
    changePassword(data, callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiAccount.php?password',
        method: 'POST',
        data: data,
        successMessage: 'Password updated successfully.',
        onSuccess: res => callbacks.onSuccess?.(res),
        onError:  err => callbacks.onError?.(err)
      });
    }
  };

  window.AccountAPI         = AccountAPI;
  window.viewOrderDetails   = orderId =>
    AccountAPI.getOrderDetails(orderId, {
      onSuccess: data => window.AccountRender.showOrderDetailsModal(data),
      onError:   err  => handleResponse(err, { errorMessage: err.message })
    });
  window.downloadInvoice    = AccountAPI.downloadInvoice.bind(AccountAPI);
})(window, jQuery);
