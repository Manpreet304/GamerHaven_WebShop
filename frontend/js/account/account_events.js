// js/account/account_events.js
(function(window, $) {
  function bindUIEvents() {
    $("#edit-account-btn").on("click", () =>
      window.AccountForms.openAccountEditForm()
    );
    $("#add-payment-method-btn").on("click", () =>
      window.AccountForms.openAddPaymentMethodForm()
    );

    // Edit Account
    $(document).on("submit", "#edit-account-form", function(e) {
      e.preventDefault();
      const form = this;
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      const payload = {
        first_name: $("#first_name").val().trim(),
        last_name:  $("#last_name").val().trim(),
        email:      $("#email").val().trim(),
        address:    $("#address").val().trim(),
        zip_code:   $("#zip_code").val().trim(),
        city:       $("#city").val().trim(),
        country:    $("#country").val().trim(),
        password:   $("#password").val().trim()
      };
      window.AccountAPI.updateAccountInfo(payload, {
        onSuccess: res => {
          // Backend liefert res.message, aber wir nutzen statischen Erfolgs-Toast
          handleResponse({ success: true }, {
            successMessage: "Account updated successfully.",
            onSuccess: () => {
              const modalEl = document.getElementById("editAccountModal");
              bootstrap.Modal.getOrCreateInstance(modalEl).hide();
              window.AccountAPI.getAccountData({
                onSuccess: window.AccountRender.renderAccountInfo
              });
            }
          });
        },
        onError: err => handleResponse(err, {
          errorMessage: err.message
        })
      });
    });

    // Add Payment Method
    $(document).on("submit", "#add-payment-method-form", function(e) {
      e.preventDefault();
      const form = this;
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      const method = $("#new-payment-method").val();
      const payload = { method };
      if (method === "Credit Card") {
        payload.card_number = $("#card_number").val().trim();
        payload.csv         = $("#csv").val().trim();
      } else if (method === "PayPal") {
        payload.paypal_email    = $("#paypal_email").val().trim();
        payload.paypal_username = $("#paypal_username").val().trim();
      } else {
        payload.iban = $("#iban").val().trim();
        payload.bic  = $("#bic").val().trim();
      }
      window.AccountAPI.addPaymentMethod(payload, {
        onSuccess: res => {
          handleResponse({ success: true }, {
            successMessage: "Payment method added.",
            onSuccess: () => {
              const modalEl = document.getElementById("addPaymentModal");
              bootstrap.Modal.getOrCreateInstance(modalEl).hide();
              window.AccountAPI.loadPaymentMethods({
                onSuccess: window.AccountRender.renderPaymentMethods
              });
            }
          });
        },
        onError: err => handleResponse(err, {
          errorMessage: err.message
        })
      });
    });

    // Change Password
    $(document).on("submit", "#change-password-form", function(e) {
      e.preventDefault();
      const form = this;
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }
      const data = {
        old_password: $("#old_password").val().trim(),
        new_password: $("#new_password").val().trim()
      };
      window.AccountAPI.changePassword(data, {
        onSuccess: res => handleResponse({ success: true }, {
          successMessage: "Password updated successfully.",
          onSuccess: () => form.reset()
        }),
        onError: err => handleResponse(err, {
          errorMessage: err.message
        })
      });
    });

    // Payment Fields onchange
    $(document).on("change", "#new-payment-method", window.AccountForms.renderPaymentFields);
  }

  $(document).ready(function() {
    window.AccountTools.initTooltips();
    window.AccountForms.injectPasswordForm();

    window.AccountAPI.getAccountData({
      onSuccess: window.AccountRender.renderAccountInfo,
      onError: err => handleResponse(err, {
        errorMessage: err.message
      })
    });

    window.AccountAPI.loadPaymentMethods({
      onSuccess: window.AccountRender.renderPaymentMethods,
      onError: err => handleResponse(err, {
        errorMessage: err.message
      })
    });

    window.AccountAPI.loadOrders({
      onSuccess: window.AccountRender.renderOrders,
      onError: err => handleResponse(err, {
        errorMessage: err.message
      })
    });

    bindUIEvents();
  });
})(window, jQuery);
