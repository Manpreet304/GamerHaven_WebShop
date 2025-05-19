(function(window, $) {
  'use strict';

  const AccountAPI = {
    getAccountData(callbacks = {}) {
      apiRequest({
        url: '../../backend/api/ApiGuest.php?me',
        method: 'GET',
        onSuccess: data => callbacks.onSuccess?.(data),
        onError: callbacks.onError
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
        url: '../../backend/api/ApiOrder.php?orders',
        method: 'GET',
        onSuccess: data => callbacks.onSuccess?.(data),
        onError: callbacks.onError
      });
    },

    getOrderDetails(orderId, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`,
        method: 'GET',
        onSuccess: data => callbacks.onSuccess?.(data),
        onError: callbacks.onError
      });
    },

    downloadInvoice(orderId) {
      window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, '_blank');
    },

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

  window.AccountAPI = AccountAPI;

  window.viewOrderDetails = orderId =>
    AccountAPI.getOrderDetails(orderId, {
      onSuccess: data => window.AccountRender.showOrderDetailsModal(data),
      onError: err => handleResponse(err, {
        errorMessage: err?.data?.error || err?.message
      })
    });

  window.downloadInvoice = AccountAPI.downloadInvoice.bind(AccountAPI);

})(window, jQuery);
