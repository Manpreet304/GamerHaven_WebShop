function initAccountPayments() {
  loadPaymentMethods();
}

// Payment Methoden laden
function loadPaymentMethods() {
  $.get("../../backend/api/ApiGuest.php?me")
    .done(function (user) {
      const container = $("#payment-methods").empty();
      if (!user.payments?.length) {
        return container.html("<p>No payment methods found.</p>");
      }

      user.payments.forEach(function (payment) {
        let extra = "";

        if (payment.method === "Credit Card") {
          extra = `<p><strong>Card:</strong> ****${payment.last_digits}</p>`;
        } else if (payment.method === "PayPal") {
          extra = `<p><strong>PayPal Email:</strong> ${payment.paypal_email}</p>`;
        } else {
          extra = `<p><strong>IBAN:</strong> ****${payment.iban.slice(-4)}</p>`;
        }

        container.append(`
          <div class="mb-3">
            <p><strong>Method:</strong> ${payment.method}</p>
            ${extra}
          </div>
        `);
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load payment methods." });
    });
}

// Modal für Payment hinzufügen öffnen
function openAddPaymentMethodForm() {
  const tpl = document.getElementById("add-payment-template");
  if (!tpl) return;
  const clone = tpl.content.cloneNode(true);

  const body = document.getElementById("add-payment-modal-body");
  body.innerHTML = "";
  body.appendChild(clone);

  new bootstrap.Modal(document.getElementById("addPaymentModal")).show();
}

// Neue Payment Methode speichern
function addPaymentMethod() {
  const method = $("#new-payment-method").val();
  const payload = { method: method };

  if (method === "Credit Card") {
    payload.card_number = $("#card_number").val()?.trim() || "";
    payload.csv = $("#csv").val()?.trim() || "";
  } else if (method === "PayPal") {
    payload.paypal_email = $("#paypal_email").val()?.trim() || "";
    payload.paypal_username = $("#paypal_username").val()?.trim() || "";
  } else if (method === "Bank Transfer") {
    payload.iban = $("#iban").val()?.trim() || "";
    payload.bic = $("#bic").val()?.trim() || "";
  }

  $.ajax({
    url: "../../backend/api/ApiAccount.php?addPayment",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function (resp) {
      handleResponse(resp, {
        successMessage: "Payment method added successfully.",
        onSuccess: function () {
          bootstrap.Modal.getInstance(document.getElementById("addPaymentModal")).hide();
          loadPaymentMethods();
        }
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to add payment method." });
    });
}

// Dynamisches Anzeigen der Felder je nach Zahlungsart
function renderPaymentFields() {
  const method = $("#new-payment-method").val();
  const container = $("#payment-fields").empty();

  if (method === "Credit Card") {
    container.html(`
      <div class="mb-3">
        <label class="form-label">Card Number</label>
        <input type="text" id="card_number" class="form-control" placeholder="4111 1111 1111 1111" required>
        <div class="invalid-feedback">Please enter a valid card number.</div>
      </div>
      <div class="mb-3">
        <label class="form-label">CSV</label>
        <input type="text" id="csv" class="form-control" placeholder="123" required>
        <div class="invalid-feedback">Please enter the CSV code.</div>
      </div>
    `);
  } else if (method === "PayPal") {
    container.html(`
      <div class="mb-3">
        <label class="form-label">PayPal Email</label>
        <input type="email" id="paypal_email" class="form-control" placeholder="yourmail@paypal.com" required>
        <div class="invalid-feedback">Please enter your PayPal email.</div>
      </div>
      <div class="mb-3">
        <label class="form-label">PayPal Username</label>
        <input type="text" id="paypal_username" class="form-control" placeholder="yourusername" required>
        <div class="invalid-feedback">Please enter your PayPal username.</div>
      </div>
    `);
  } else if (method === "Bank Transfer") {
    container.html(`
      <div class="mb-3">
        <label class="form-label">IBAN</label>
        <input type="text" id="iban" class="form-control" placeholder="AT61 1904 3002 3457 3201" required>
        <div class="invalid-feedback">Please enter your IBAN.</div>
      </div>
      <div class="mb-3">
        <label class="form-label">BIC</label>
        <input type="text" id="bic" class="form-control" placeholder="BAWAATWW" required>
        <div class="invalid-feedback">Please enter your BIC.</div>
      </div>
    `);
  }
}
