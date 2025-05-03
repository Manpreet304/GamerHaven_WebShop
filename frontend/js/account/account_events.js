/**
 * js/account/account_events.js
 * Verantwortlich für UI-Events im Account-Bereich
 */
(function(window, $) {
  'use strict';

  function bindUIEvents() {
    // Buttons zum Öffnen der Modals
    $('#edit-account-btn')
      .on('click', () => window.AccountForms.openAccountEditForm());
    $('#add-payment-method-btn')
      .on('click', () => window.AccountForms.openAddPaymentMethodForm());

    // Account-Daten speichern
    $(document).on('submit', '#edit-account-form', handleEditAccountSubmit);

    // Neue Zahlungsmethode hinzufügen
    $(document).on('submit', '#add-payment-method-form', handleAddPaymentSubmit);

    // Passwort ändern
    $(document).on('submit', '#change-password-form', handleChangePasswordSubmit);

    // Dynamisches Umschalten der Payment-Felder
    $(document).on('change', '#new-payment-method',
      window.AccountForms.renderPaymentFields);
  }

  function handleEditAccountSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
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
      onSuccess: () => {
        bootstrap.Modal
          .getOrCreateInstance('#editAccountModal')
          .hide();
        window.AccountAPI.getAccountData({
          onSuccess: window.AccountRender.renderAccountInfo
        });
      },
      onError: () => {
        // Fehlermeldung kommt automatisch via apiRequest/handleResponse
      }
    });
  }

  function handleAddPaymentSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    const method  = $('#new-payment-method').val();
    const payload = { method };
    if (method === 'Credit Card') {
      payload.card_number     = $('#card_number').val().trim();
      payload.csv             = $('#csv').val().trim();
    } else if (method === 'PayPal') {
      payload.paypal_email    = $('#paypal_email').val().trim();
      payload.paypal_username = $('#paypal_username').val().trim();
    } else {
      payload.iban = $('#iban').val().trim();
      payload.bic  = $('#bic').val().trim();
    }

    window.AccountAPI.addPaymentMethod(payload, {
      onSuccess: () => {
        bootstrap.Modal
          .getOrCreateInstance('#addPaymentModal')
          .hide();
        window.AccountAPI.loadPaymentMethods({
          onSuccess: window.AccountRender.renderPaymentMethods
        });
      },
      onError: () => {
        // Fehlermeldung automatisch
      }
    });
  }

  function handleChangePasswordSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
    const data = {
      old_password:     $('#old_password').val().trim(),
      new_password:     $('#new_password').val().trim(),
      confirm_password: $('#confirm_password').val().trim()
    };

    window.AccountAPI.changePassword(data, {
      onSuccess: () => {
        form.reset();
      },
      onError: () => {
        // Fehlermeldung automatisch
      }
    });
  }

  // Initialisierung bei DOM-Ready
  $(document).ready(() => {
    window.AccountTools.initTooltips();
    window.AccountForms.injectPasswordForm();

    window.AccountAPI.getAccountData({
      onSuccess: window.AccountRender.renderAccountInfo
    });
    window.AccountAPI.loadPaymentMethods({
      onSuccess: window.AccountRender.renderPaymentMethods
    });
    window.AccountAPI.loadOrders({
      onSuccess: window.AccountRender.renderOrders
    });

    bindUIEvents();
  });
})(window, jQuery);
