/**
 * js/account/account_events.js
 * Verantwortlich für UI-Events im Account-Bereich
 */
(function(window, $) {
  'use strict';

  function bindUIEvents() {
    // Buttons öffnen Formulare
    $('#edit-account-btn').on('click',    () => window.AccountForms.openAccountEditForm());
    $('#add-payment-method-btn').on('click', () => window.AccountForms.openAddPaymentMethodForm());

    // Account-Formular absenden
    $(document).on('submit', '#edit-account-form', function(e) {
      e.preventDefault();
      const form = this;
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const payload = {
        first_name: $('#first_name').val().trim(),
        last_name:  $('#last_name').val().trim(),
        email:      $('#email').val().trim(),
        address:    $('#address').val().trim(),
        zip_code:   $('#zip_code').val().trim(),
        city:       $('#city').val().trim(),
        country:    $('#country').val().trim(),
        password:   $('#password').val().trim()
      };
      window.AccountAPI.updateAccountInfo(payload, {
        onSuccess: () => handleResponse({ success: true }, {
          successMessage: 'Account updated successfully.',
          onSuccess: () => {
            bootstrap.Modal.getOrCreateInstance('#editAccountModal').hide();
            window.AccountAPI.getAccountData({ onSuccess: window.AccountRender.renderAccountInfo });
          }
        }),
        onError: err => handleResponse(err, { errorMessage: err.message })
      });
    });

    // Zahlungsmethode hinzufügen
    $(document).on('submit', '#add-payment-method-form', function(e) {
      e.preventDefault();
      const form = this;
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const method  = $('#new-payment-method').val();
      const payload = { method };
      if (method === 'Credit Card') {
        payload.card_number = $('#card_number').val().trim();
        payload.csv         = $('#csv').val().trim();
      } else if (method === 'PayPal') {
        payload.paypal_email    = $('#paypal_email').val().trim();
        payload.paypal_username = $('#paypal_username').val().trim();
      } else {
        payload.iban = $('#iban').val().trim();
        payload.bic  = $('#bic').val().trim();
      }
      window.AccountAPI.addPaymentMethod(payload, {
        onSuccess: () => handleResponse({ success: true }, {
          successMessage: 'Payment method added.',
          onSuccess: () => {
            bootstrap.Modal.getOrCreateInstance('#addPaymentModal').hide();
            window.AccountAPI.loadPaymentMethods({ onSuccess: window.AccountRender.renderPaymentMethods });
          }
        }),
        onError: err => handleResponse(err, { errorMessage: err.message })
      });
    });

    // Passwort ändern
    $(document).on('submit', '#change-password-form', function(e) {
      e.preventDefault();
      const form = this;
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const data = {
        old_password: $('#old_password').val().trim(),
        new_password: $('#new_password').val().trim()
      };
      window.AccountAPI.changePassword(data, {
        onSuccess: () => handleResponse({ success: true }, {
          successMessage: 'Password updated successfully.',
          onSuccess: () => form.reset()
        }),
        onError: err => handleResponse(err, { errorMessage: err.message })
      });
    });

    // Dynamisches Einblenden der Felder
    $(document).on('change', '#new-payment-method', window.AccountForms.renderPaymentFields);
  }

  // Initialisierung
  $(document).ready(() => {
    window.AccountTools.initTooltips();
    window.AccountForms.injectPasswordForm();

    window.AccountAPI.getAccountData({
      onSuccess: window.AccountRender.renderAccountInfo,
      onError:   err => handleResponse(err, { errorMessage: err.message })
    });
    window.AccountAPI.loadPaymentMethods({
      onSuccess: window.AccountRender.renderPaymentMethods,
      onError:   err => handleResponse(err, { errorMessage: err.message })
    });
    window.AccountAPI.loadOrders({
      onSuccess: window.AccountRender.renderOrders,
      onError:   err => handleResponse(err, { errorMessage: err.message })
    });

    bindUIEvents();
  });
})(window, jQuery);
