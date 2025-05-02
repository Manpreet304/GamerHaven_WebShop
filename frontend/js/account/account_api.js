(function(window, $) {
  const AccountAPI = {
    getAccountData(callbacks = {}) {
      $.get("../../backend/api/ApiGuest.php?me")
        .done(response => {
          const { success, data, message, errors } = response;
          if (success) callbacks.onSuccess?.(data);
          else callbacks.onError?.({ message, errors });
        })
        .fail(xhr => callbacks.onError?.(xhr));
    },

    loadPaymentMethods(callbacks = {}) {
      this.getAccountData({
        onSuccess: data => callbacks.onSuccess?.(data.payments || []),
        onError: callbacks.onError
      });
    },

    loadOrders(callbacks = {}) {
      $.get("../../backend/api/ApiOrder.php?orders")
        .done(response => {
          const { success, data, message, errors } = response;
          if (success) callbacks.onSuccess?.(data.body || []);
          else callbacks.onError?.({ message, errors });
        })
        .fail(xhr => callbacks.onError?.(xhr));
    },

    getOrderDetails(orderId, callbacks = {}) {
      $.get(`../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`)
        .done(response => {
          const { success, data, message, errors } = response;
          if (success) callbacks.onSuccess?.(data);
          else callbacks.onError?.({ message, errors });
        })
        .fail(xhr => callbacks.onError?.(xhr));
    },

    downloadInvoice(orderId) {
      window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, "_blank");
    },

    updateAccountInfo(payload, callbacks = {}) {
      $.ajax({
        url: "../../backend/api/ApiAccount.php?update",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload)
      })
        .done(response => {
          const { success, data, message, errors } = response;
          if (success) callbacks.onSuccess?.(data);
          else callbacks.onError?.({ message, errors });
        })
        .fail(xhr => callbacks.onError?.(xhr));
    },

    addPaymentMethod(payload, callbacks = {}) {
      $.ajax({
        url: "../../backend/api/ApiAccount.php?addPayment",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(payload)
      })
        .done(response => {
          const { success, data, message, errors } = response;
          if (success) callbacks.onSuccess?.(data);
          else callbacks.onError?.({ message, errors });
        })
        .fail(xhr => callbacks.onError?.(xhr));
    },

    changePassword(data, callbacks = {}) {
      $.ajax({
        url: "../../backend/api/ApiAccount.php?password",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data)
      })
        .done(response => {
          const { success, data: respData, message, errors } = response;
          if (success) callbacks.onSuccess?.(respData);
          else callbacks.onError?.({ message, errors });
        })
        .fail(xhr => callbacks.onError?.(xhr));
    }
  };

  window.AccountAPI = AccountAPI;
  window.viewOrderDetails = orderId => AccountAPI.getOrderDetails(orderId, {
    onSuccess: data => window.AccountRender.showOrderDetailsModal(data),
    onError: xhr => handleResponse(xhr, { errorMessage: "Failed to load order details." })
  });
  window.downloadInvoice = AccountAPI.downloadInvoice.bind(AccountAPI);
})(window, jQuery);
