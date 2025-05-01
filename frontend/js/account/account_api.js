// js/account.api.js
(function(window, $) {
    const AccountAPI = {
      getAccountData(callbacks = {}) {
        $.get("../../backend/api/ApiGuest.php?me")
          .done(user => callbacks.onSuccess?.(user))
          .fail(xhr => callbacks.onError?.(xhr));
      },
  
      loadPaymentMethods(callbacks = {}) {
        // wir rufen dieselbe „me“-Route erneut, um payments zu holen
        this.getAccountData({
          onSuccess: user => callbacks.onSuccess?.(user.payments || []),
          onError: callbacks.onError
        });
      },
  
      loadOrders(callbacks = {}) {
        $.get("../../backend/api/ApiOrder.php?orders")
          .done(orders => callbacks.onSuccess?.(orders))
          .fail(xhr => callbacks.onError?.(xhr));
      },
  
      getOrderDetails(orderId, callbacks = {}) {
        $.get(`../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`)
          .done(res => callbacks.onSuccess?.(res))
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
          .done(resp => callbacks.onSuccess?.(resp))
          .fail(xhr => callbacks.onError?.(xhr));
      },
  
      addPaymentMethod(payload, callbacks = {}) {
        $.ajax({
          url: "../../backend/api/ApiAccount.php?addPayment",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload)
        })
          .done(resp => callbacks.onSuccess?.(resp))
          .fail(xhr => callbacks.onError?.(xhr));
      },
  
      changePassword(data, callbacks = {}) {
        $.ajax({
          url: "../../backend/api/ApiAccount.php?password",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(data)
        })
          .done(resp => callbacks.onSuccess?.(resp))
          .fail(xhr => callbacks.onError?.(xhr));
      }
    };
  
    // Exporte
    window.AccountAPI = AccountAPI;
    window.viewOrderDetails = orderId => AccountAPI.getOrderDetails(orderId, {
      onSuccess: res => window.AccountRender.showOrderDetailsModal(res),
      onError: xhr => handleResponse(xhr.responseJSON||{}, {
        errorMessage: "Failed to load order details."
      })
    });
    window.downloadInvoice = AccountAPI.downloadInvoice.bind(AccountAPI);
  })(window, jQuery);
  