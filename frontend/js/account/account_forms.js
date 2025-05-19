/**
 * js/account/account_forms.js
 * Verantwortlich für Einfügen und Anzeigen von Account-Formularen
 */
(function(window, $) {
  'use strict';

  // [1] Formular-Logik für den Account-Bereich
  const AccountForms = {

    // [1.1] Passwort-Formular in DOM injizieren (via Template)
    injectPasswordForm() {
      const tpl  = document.getElementById('password-change-template');
      $('#password-change-section').append(tpl.content.cloneNode(true));
    },

    // [1.2] Modal zur Kontobearbeitung mit aktuellen Daten füllen und anzeigen
    openAccountEditForm() {
      window.AccountAPI.getAccountData({
        onSuccess: user => {
          const tpl   = document.getElementById('account-edit-template');
          const clone = tpl.content.cloneNode(true);
          clone.querySelector('#first_name').value = user.first_name;
          clone.querySelector('#last_name').value  = user.last_name;
          clone.querySelector('#username').value   = user.username; 
          clone.querySelector('#email').value      = user.email;
          clone.querySelector('#address').value    = user.address;
          clone.querySelector('#zip_code').value   = user.zip_code;
          clone.querySelector('#city').value       = user.city;
          clone.querySelector('#country').value    = user.country;

          $('#edit-account-modal-body').empty().append(clone);
          bootstrap.Modal.getOrCreateInstance('#editAccountModal').show();
        },
        onError: err => handleResponse(err, {})
      });
    },

    // [1.3] Modal zur Zahlungsmethode hinzufügen anzeigen (leeres Template)
    openAddPaymentMethodForm() {
      const tpl   = document.getElementById('add-payment-template');
      const clone = tpl.content.cloneNode(true);
      $('#add-payment-modal-body').empty().append(clone);
      bootstrap.Modal.getOrCreateInstance('#addPaymentModal').show();
    },

    // [1.4] Dynamisches Umschalten der Eingabefelder je nach Zahlungsart
    renderPaymentFields() {
      const method    = this.value;
      const $cont     = $('#payment-fields').empty();

      if (method === 'Credit Card') {
        $cont.append(`
          <div class="mb-3">
            <label class="form-label">Card Number</label>
            <input type="text" id="card_number" class="form-control" placeholder="4111 1111 1111 1111" required pattern="\\d{13,19}">
            <div class="invalid-feedback">Enter a valid card number.</div>
          </div>
          <div class="mb-3">
            <label class="form-label">CSV</label>
            <input type="text" id="csv" class="form-control" placeholder="123" required pattern="\\d{3,4}">
            <div class="invalid-feedback">Enter the 3– or 4–digit CSV.</div>
          </div>
        `);
      } else if (method === 'PayPal') {
        $cont.append(`
          <div class="mb-3">
            <label class="form-label">PayPal Email</label>
            <input type="email" id="paypal_email" class="form-control" placeholder="you@paypal.com" required>
            <div class="invalid-feedback">Enter your PayPal email.</div>
          </div>
          <div class="mb-3">
            <label class="form-label">PayPal Username</label>
            <input type="text" id="paypal_username" class="form-control" placeholder="username" required>
            <div class="invalid-feedback">Enter your PayPal username.</div>
          </div>
        `);
      } else {
        $cont.append(`
          <div class="mb-3">
            <label class="form-label">IBAN</label>
            <input type="text" id="iban" class="form-control" placeholder="AT61..." required>
            <div class="invalid-feedback">Enter your IBAN.</div>
          </div>
          <div class="mb-3">
            <label class="form-label">BIC</label>
            <input type="text" id="bic" class="form-control" placeholder="BAWAATWW" required>
            <div class="invalid-feedback">Enter the BIC.</div>
          </div>
        `);
      }
    }
  };

  // [2] Objekt global verfügbar machen
  window.AccountForms = AccountForms;

})(window, jQuery);