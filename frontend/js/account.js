// account.js

$(document).ready(() => {
  initTooltips();
  injectPasswordForm();
  loadAccountInfo();
  loadPaymentMethods();
  loadOrders();
  bindUIEvents();
});

function loadAccountInfo() {
  $.get("../../backend/api/ApiGuest.php?me")
    .done(user => {
      $("#account-info").html(`
        <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Address:</strong> ${user.address}, ${user.zip_code} ${user.city}, ${user.country}</p>
      `);
    })
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Failed to load account info."
    }));
}

function loadPaymentMethods() {
  $.get("../../backend/api/ApiGuest.php?me")
    .done(user => {
      const container = $("#payment-methods").empty();
      if (!user.payments?.length) {
        return container.html("<p>No payment methods found.</p>");
      }
      user.payments.forEach(p => {
        let extra = "";
        if (p.method === "Credit Card") {
          extra = `<p><strong>Card:</strong> ****${p.last_digits}</p>`;
        } else if (p.method === "PayPal") {
          extra = `<p><strong>PayPal Email:</strong> ${p.paypal_email}</p>
                   <p><strong>PayPal Username:</strong> ${p.paypal_username}</p>`;
        } else {
          extra = `<p><strong>IBAN:</strong> ****${p.iban.slice(-4)}</p>`;
        }
        container.append(`
          <div class="mb-3">
            <p><strong>Method:</strong> ${p.method}</p>
            ${extra}
          </div>
        `);
      });
    })
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Failed to load payment methods."
    }));
}

function loadOrders() {
  $.get("../../backend/api/ApiOrder.php?orders")
    .done(orders => {
      const c = $("#order-list").empty();
      if (!orders.length) {
        return c.html("<p>You have no orders.</p>");
      }
      orders.forEach(o => {
        c.append(`
          <div class="border rounded p-3 mb-3 bg-light">
            <h6>Order #${o.id} - <small>${o.created_at}</small></h6>
            <p><strong>Total:</strong> €${o.total_amount}</p>
            <button class="btn btn-info btn-sm me-2" onclick="viewOrderDetails(${o.id})">
              <i class="bi bi-eye"></i> View Details
            </button>
            <button class="btn btn-primary btn-sm" onclick="downloadInvoice(${o.id})">
              <i class="bi bi-printer"></i> Download Invoice
            </button>
          </div>
        `);
      });
    })
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Failed to load orders."
    }));
}

function viewOrderDetails(orderId) {
  $.get(`../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`)
    .done(res => {
      $("#modal-order-id").text(res.order.id);
      $("#modal-order-date").text(res.order.created_at);
      $("#modal-subtotal").text(res.order.subtotal);
      $("#modal-discount").text(res.order.discount);
      $("#modal-shipping").text(res.order.shipping_amount);
      $("#modal-total").text(res.order.total_amount);
      const body = $("#modal-items-body").empty();
      res.items.forEach(item => {
        body.append(`
          <tr>
            <td>${item.name_snapshot}</td>
            <td>€${item.price_snapshot}</td>
            <td>${item.quantity}</td>
            <td>€${item.total_price}</td>
          </tr>
        `);
      });
      new bootstrap.Modal(document.getElementById("orderDetailsModal")).show();
    })
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Failed to load order details."
    }));
}

function downloadInvoice(orderId) {
  window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, "_blank");
}

function openAccountEditForm() {
  $.get("../../backend/api/ApiGuest.php?me")
    .done(user => {
      const tpl = document.getElementById("account-edit-template");
      const clone = tpl.content.cloneNode(true);
      clone.querySelector("#first_name").value = user.first_name;
      clone.querySelector("#last_name").value = user.last_name;
      clone.querySelector("#email").value = user.email;
      clone.querySelector("#address").value = user.address;
      clone.querySelector("#zip_code").value = user.zip_code;
      clone.querySelector("#city").value = user.city;
      clone.querySelector("#country").value = user.country;
      document.getElementById("edit-account-modal-body").innerHTML = "";
      document.getElementById("edit-account-modal-body").appendChild(clone);
      new bootstrap.Modal(document.getElementById("editAccountModal")).show();
    })
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Could not load account data."
    }));
}

function updateAccountInfo() {
  const payload = {
    first_name: $("#first_name").val().trim(),
    last_name: $("#last_name").val().trim(),
    email: $("#email").val().trim(),
    address: $("#address").val().trim(),
    zip_code: $("#zip_code").val().trim(),
    city: $("#city").val().trim(),
    country: $("#country").val().trim(),
    password: $("#password").val().trim()
  };

  $.ajax({
    url: "../../backend/api/ApiAccount.php?update",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(resp => handleResponse(resp, {
      successMessage: "Account updated successfully.",
      onSuccess: () => {
        bootstrap.Modal.getInstance(document.getElementById("editAccountModal")).hide();
        loadAccountInfo();
      }
    }))
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Update failed."
    }));
}

function openAddPaymentMethodForm() {
  const tpl = document.getElementById("add-payment-template");
  const clone = tpl.content.cloneNode(true);
  document.getElementById("add-payment-modal-body").innerHTML = "";
  document.getElementById("add-payment-modal-body").appendChild(clone);
  new bootstrap.Modal(document.getElementById("addPaymentModal")).show();
}

function renderPaymentFields() {
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

function addPaymentMethod() {
  const method = $("#new-payment-method").val();
  const payload = { method };

  if (method === "Credit Card") {
    payload.card_number = $("#card_number").val().trim();
    payload.csv = $("#csv").val().trim();
  } else if (method === "PayPal") {
    payload.paypal_email = $("#paypal_email").val().trim();
    payload.paypal_username = $("#paypal_username").val().trim();
  } else {
    payload.iban = $("#iban").val().trim();
    payload.bic = $("#bic").val().trim();
  }

  $.ajax({
    url: "../../backend/api/ApiAccount.php?addPayment",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(resp => handleResponse(resp, {
      successMessage: "Payment method added.",
      onSuccess: () => {
        bootstrap.Modal.getInstance(document.getElementById("addPaymentModal")).hide();
        loadPaymentMethods();
      }
    }))
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Could not add payment method."
    }));
}

function changePassword() {
  const data = {
    old_password: $("#old_password").val().trim(),
    new_password: $("#new_password").val().trim()
  };

  $.ajax({
    url: "../../backend/api/ApiAccount.php?password",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data)
  })
    .done(resp => handleResponse(resp, {
      successMessage: "Password updated successfully.",
      onSuccess: () => $("#change-password-form")[0].reset()
    }))
    .fail(xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Password update failed."
    }));
}

function initTooltips() {
  $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
}

function injectPasswordForm() {
  const tpl = document.getElementById("password-change-template");
  document.getElementById("password-change-section")
    .appendChild(tpl.content.cloneNode(true));
}

function bindUIEvents() {
  $("#edit-account-btn").on("click", openAccountEditForm);
  $("#add-payment-method-btn").on("click", openAddPaymentMethodForm);
  $(document).on("submit", "#edit-account-form", function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return;
    }
    updateAccountInfo();
  });
  $(document).on("submit", "#add-payment-method-form", function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return;
    }
    addPaymentMethod();
  });
  $(document).on("change", "#new-payment-method", renderPaymentFields);
  $(document).on("submit", "#change-password-form", function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      this.classList.add("was-validated");
      return;
    }
    changePassword();
  });
}
