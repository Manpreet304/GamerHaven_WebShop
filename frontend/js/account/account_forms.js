(function(window, $) {
  const AccountForms = {
    injectPasswordForm() {
      const tpl = document.getElementById("password-change-template");
      document.getElementById("password-change-section")
        .appendChild(tpl.content.cloneNode(true));
    },

    openAccountEditForm() {
      window.AccountAPI.getAccountData({
        onSuccess: userData => {
          const tpl = document.getElementById("account-edit-template");
          const clone = tpl.content.cloneNode(true);
          clone.querySelector("#first_name").value = userData.first_name;
          clone.querySelector("#last_name").value = userData.last_name;
          clone.querySelector("#email").value = userData.email;
          clone.querySelector("#address").value = userData.address;
          clone.querySelector("#zip_code").value = userData.zip_code;
          clone.querySelector("#city").value = userData.city;
          clone.querySelector("#country").value = userData.country;
          const body = document.getElementById("edit-account-modal-body");
          body.innerHTML = "";
          body.appendChild(clone);
          const modalEl = document.getElementById("editAccountModal");
          const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
          modal.show();
        },
        onError: xhr => handleResponse(xhr, { errorMessage: "Could not load account data." })
      });
    },

    openAddPaymentMethodForm() {
      const tpl = document.getElementById("add-payment-template");
      const clone = tpl.content.cloneNode(true);
      const body = document.getElementById("add-payment-modal-body");
      body.innerHTML = "";
      body.appendChild(clone);
      const modalEl = document.getElementById("addPaymentModal");
      const modal   = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    },

    renderPaymentFields() {
      const method = this.value;
      const container = $("#payment-fields").empty();
      if (method === "Credit Card") {
        container.append(`
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
      } else if (method === "PayPal") {
        container.append(`
          <div class="mb-3">
            <label class="form-label">PayPal Email</label>
            <input type="email" id="paypal_email" class="form-control" placeholder="yourmail@paypal.com" required>
            <div class="invalid-feedback">Enter your PayPal email.</div>
          </div>
          <div class="mb-3">
            <label class="form-label">PayPal Username</label>
            <input type="text" id="paypal_username" class="form-control" placeholder="yourusername" required>
            <div class="invalid-feedback">Enter your PayPal username.</div>
          </div>
        `);
      } else {
        container.append(`
          <div class="mb-3">
            <label class="form-label">IBAN</label>
            <input type="text" id="iban" class="form-control" placeholder="AT61 1904 3002 3457 3201" required>
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

  window.AccountForms = AccountForms;
})(window, jQuery);
