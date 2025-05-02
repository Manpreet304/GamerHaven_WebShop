(function(window, $) {
  function bindUIEvents() {
    $("#edit-account-btn").on("click", () => window.AccountForms.openAccountEditForm());
    $("#add-payment-method-btn").on("click", () => window.AccountForms.openAddPaymentMethodForm());

    // Edit Account
    $(document).on("submit", "#edit-account-form", function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add("was-validated");
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
        onSuccess: () => {
          handleResponse({ success: true }, {
            successMessage: "Account updated successfully.",
            onSuccess: () => {
              const modalEl = document.getElementById("editAccountModal");
              const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
              modal.hide();
              window.AccountAPI.getAccountData({ onSuccess: window.AccountRender.renderAccountInfo });
            }
          });
        },
        onError: xhr => handleResponse(xhr, { errorMessage: "Update failed." })
      });
    });

    // Add Payment Method
    $(document).on("submit", "#add-payment-method-form", function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add("was-validated");
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
        onSuccess: () => {
          handleResponse({ success: true }, {
            successMessage: "Payment method added.",
            onSuccess: () => {
              const modalEl = document.getElementById("addPaymentModal");
              const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
              modal.hide();
              window.AccountAPI.loadPaymentMethods({ onSuccess: window.AccountRender.renderPaymentMethods });
            }
          });
        },
        onError: xhr => handleResponse(xhr, { errorMessage: "Could not add payment method." })
      });
    });

    // Change Password
    $(document).on("submit", "#change-password-form", function(e) {
      e.preventDefault();
      if (!this.checkValidity()) {
        this.classList.add("was-validated");
        return;
      }
      const data = {
        old_password: $("#old_password").val().trim(),
        new_password: $("#new_password").val().trim()
      };
      window.AccountAPI.changePassword(data, {
        onSuccess: () => handleResponse({ success: true }, {
          successMessage: "Password updated successfully.",
          onSuccess: () => $("#change-password-form")[0].reset()
        }),
        onError: xhr => handleResponse(xhr, { errorMessage: "Password update failed." })
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
      onError: xhr => handleResponse(xhr, { errorMessage: "Failed to load account info." })
    });

    window.AccountAPI.loadPaymentMethods({
      onSuccess: window.AccountRender.renderPaymentMethods,
      onError: xhr => handleResponse(xhr, { errorMessage: "Failed to load payment methods." })
    });

    window.AccountAPI.loadOrders({
      onSuccess: window.AccountRender.renderOrders,
      onError: xhr => handleResponse(xhr, { errorMessage: "Failed to load orders." })
    });

    bindUIEvents();
  });
})(window, jQuery);
