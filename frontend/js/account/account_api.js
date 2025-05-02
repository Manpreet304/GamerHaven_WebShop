// js/account/account_api.js
(function(window, $) {
  const AccountAPI = {
    getAccountData(callbacks = {}) {
      apiRequest({
        url: "../../backend/api/ApiGuest.php?me",
        method: "GET",
        // kein statischer errorMessage: resp.message wird genutzt
        onSuccess: res => {
          // res.data ist das User-Objekt
          callbacks.onSuccess?.(res.data);
        },
        onError: err => {
          callbacks.onError?.(err);
        }
      });
    },

    loadPaymentMethods(callbacks = {}) {
      this.getAccountData({
        onSuccess: user => callbacks.onSuccess?.(user.payments || []),
        onError: callbacks.onError
      });
    },

    loadOrders(callbacks = {}) {
      apiRequest({
        url: "../../backend/api/ApiOrder.php?orders",
        method: "GET",
        onSuccess: res => {
          // res.data.body ist das Array der Orders
          callbacks.onSuccess?.(res.data.body || []);
        },
        onError: err => {
          callbacks.onError?.(err);
        }
      });
    },

    getOrderDetails(orderId, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`,
        method: "GET",
        onSuccess: res => {
          // res.data enthält { order: {...}, items: [...] }
          callbacks.onSuccess?.(res.data);
        },
        onError: err => {
          callbacks.onError?.(err);
        }
      });
    },

    downloadInvoice(orderId) {
      window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, "_blank");
    },

    updateAccountInfo(payload, callbacks = {}) {
      apiRequest({
        url: "../../backend/api/ApiAccount.php?update",
        method: "POST",
        data: payload,
        successMessage: "Account updated successfully.",
        onSuccess: res => callbacks.onSuccess?.(res),
        onError: err => callbacks.onError?.(err)
      });
    },

    addPaymentMethod(payload, callbacks = {}) {
      apiRequest({
        url: "../../backend/api/ApiAccount.php?addPayment",
        method: "POST",
        data: payload,
        successMessage: "Payment method added.",
        onSuccess: res => callbacks.onSuccess?.(res),
        onError: err => callbacks.onError?.(err)
      });
    },

    changePassword(data, callbacks = {}) {
      apiRequest({
        url: "../../backend/api/ApiAccount.php?password",
        method: "POST",
        data: data,
        successMessage: "Password updated successfully.",
        onSuccess: res => callbacks.onSuccess?.(res),
        onError: err => callbacks.onError?.(err)
      });
    }
  };

  window.AccountAPI = AccountAPI;
  // Hilfsfunktionen für globalen Zugriff
  window.viewOrderDetails = orderId =>
    AccountAPI.getOrderDetails(orderId, {
      onSuccess: data => window.AccountRender.showOrderDetailsModal(data),
      onError: err => handleResponse(err, { errorMessage: err.message })
    });
  window.downloadInvoice = AccountAPI.downloadInvoice.bind(AccountAPI);
})(window, jQuery);
