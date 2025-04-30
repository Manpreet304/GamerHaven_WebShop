// js/account.forms.js
(function(window, $) {
    const AccountForms = {
      injectPasswordForm() {
        const tpl = document.getElementById("password-change-template");
        document.getElementById("password-change-section")
          .appendChild(tpl.content.cloneNode(true));
      },
  
      openAccountEditForm() {
        window.AccountAPI.getAccountData({
          onSuccess: user => {
            const tpl = document.getElementById("account-edit-template");
            const clone = tpl.content.cloneNode(true);
            clone.querySelector("#first_name").value = user.first_name;
            clone.querySelector("#last_name").value = user.last_name;
            clone.querySelector("#email").value = user.email;
            clone.querySelector("#address").value = user.address;
            clone.querySelector("#zip_code").value = user.zip_code;
            clone.querySelector("#city").value = user.city;
            clone.querySelector("#country").value = user.country;
            const body = document.getElementById("edit-account-modal-body");
            body.innerHTML = "";
            body.appendChild(clone);
            new bootstrap.Modal(document.getElementById("editAccountModal")).show();
          },
          onError: xhr => handleResponse(xhr.responseJSON||{}, {
            errorMessage: "Could not load account data."
          })
        });
      },
  
      openAddPaymentMethodForm() {
        const tpl = document.getElementById("add-payment-template");
        const clone = tpl.content.cloneNode(true);
        const body = document.getElementById("add-payment-modal-body");
        body.innerHTML = "";
        body.appendChild(clone);
        new bootstrap.Modal(document.getElementById("addPaymentModal")).show();
      },
  
      renderPaymentFields() {
        const method = this.value;
        const container = $("#payment-fields").empty();
        if (method === "Credit Card") {
          container.append(`
            <div class="mb-3">
              <label class="form-label">Card Number</label>
              <input type="text" id="card_number" class="form-control" required pattern="\\d{13,19}">
              <div class="invalid-feedback">Enter a valid card number.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">CSV</label>
              <input type="text" id="csv" class="form-control" required pattern="\\d{3,4}">
              <div class="invalid-feedback">Enter the 3– or 4–digit CSV.</div>
            </div>
          `);
        } else if (method === "PayPal") {
          container.append(`
            <div class="mb-3">
              <label class="form-label">PayPal Email</label>
              <input type="email" id="paypal_email" class="form-control" required>
              <div class="invalid-feedback">Enter your PayPal email.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">PayPal Username</label>
              <input type="text" id="paypal_username" class="form-control" required>
              <div class="invalid-feedback">Enter your PayPal username.</div>
            </div>
          `);
        } else {
          container.append(`
            <div class="mb-3">
              <label class="form-label">IBAN</label>
              <input type="text" id="iban" class="form-control" required>
              <div class="invalid-feedback">Enter your IBAN.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">BIC</label>
              <input type="text" id="bic" class="form-control" required>
              <div class="invalid-feedback">Enter the BIC.</div>
            </div>
          `);
        }
      }
    };
  
    window.AccountForms = AccountForms;
  })(window, jQuery);
  