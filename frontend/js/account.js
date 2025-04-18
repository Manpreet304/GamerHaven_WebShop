$(document).ready(function () {
  // 1) Tooltips initialisieren
  const tipList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tipList.forEach(el => new bootstrap.Tooltip(el));

  // 2) Initial load
  loadAccountInfo();
  loadPaymentMethods();
  loadOrders();

  // 3) Button‑Handler
  $("#edit-account-btn").on("click", openAccountEditForm);
  $("#add-payment-method-btn").on("click", openAddPaymentMethodForm);

  // 4) Edit‑Form mit Validierung
  $(document).on("submit", "#edit-account-form", function (e) {
    e.preventDefault();
    const form = this;
    $(form).removeClass("was-validated");
    $(form).find("input").removeClass("is-valid is-invalid").each(function() {
      this.setCustomValidity("");
    });
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    updateAccountInfo();
  });

  // 5) Add Payment Method mit Validierung
  $(document).on("submit", "#add-payment-method-form", function (e) {
    e.preventDefault();
    const form = this;
    $(form).removeClass("was-validated");
    $(form).find("select,input").removeClass("is-valid is-invalid").each(function() {
      this.setCustomValidity("");
    });
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    addPaymentMethod();
  });

  // 6) Inject Change‑Password Form
  const pwTpl = document.getElementById("password-change-template");
  $("#password-change-section").html(pwTpl.content.cloneNode(true));

  // 7) Change Password mit Validierung
  $(document).on("submit", "#change-password-form", function (e) {
    e.preventDefault();
    const form = this;
    $(form).removeClass("was-validated");
    $(form).find("input").removeClass("is-valid is-invalid").each(function() {
      this.setCustomValidity("");
    });
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }
    const newP = $("#new_password").val().trim(),
          conf = $("#confirm_password").val().trim();
    if (newP !== conf) {
      setFieldError("#confirm_password", "Passwords do not match.");
      return;
    }
    setFieldValid("#confirm_password");
    changePassword();
  });
});

// === Account Info ===
function loadAccountInfo() {
  $.get("../../backend/api/ApiGuest.php?me", function(user) {
    const html = `
      <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Address:</strong> ${user.address}, ${user.zip_code} ${user.city}, ${user.country}</p>
    `;
    $("#account-info").html(html);
  });
}

function openAccountEditForm() {
  $.get("../../backend/api/ApiGuest.php?me", function(user) {
    const tpl   = document.getElementById("account-edit-template");
    const clone = tpl.content.cloneNode(true);
    clone.querySelector("#first_name").value = user.first_name;
    clone.querySelector("#last_name").value  = user.last_name;
    clone.querySelector("#email").value      = user.email;
    clone.querySelector("#address").value    = user.address;
    clone.querySelector("#zip_code").value   = user.zip_code;
    clone.querySelector("#city").value       = user.city;
    clone.querySelector("#country").value    = user.country;
    $("#account-info").html(clone);
  });
}

function updateAccountInfo() {
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

  $.ajax({
    url: "../../backend/api/ApiAccount.php?update",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload),
    success(response) {
      if (response.success) {
        showMessage("success", "Account updated successfully.");
        loadAccountInfo();
      } else {
        showMessage("danger", response.error || "Update failed.");
      }
    },
    error(xhr) {
      showMessage("danger", xhr.responseJSON?.error || "An error occurred.");
    }
  });
}

// === Payment Methods ===
function loadPaymentMethods() {
  $.get("../../backend/api/ApiGuest.php?me", function(user) {
    const c = $("#payment-methods").empty();
    if (user.payments?.length) {
      user.payments.forEach(p => {
        const html = `
          <div class="mb-3">
            <p><strong>Method:</strong> ${p.method}</p>
            ${p.method==="Credit Card"  ? `<p><strong>Card:</strong> ****${p.last_digits}</p>` : ""}
            ${p.method==="PayPal"       ? `<p><strong>PayPal Email:</strong> ${p.paypal_email}</p>` : ""}
            ${p.method==="Bank Transfer"? `<p><strong>IBAN:</strong> ****${p.iban.slice(-4)}</p>` : ""}
          </div>
        `;
        c.append(html);
      });
    } else {
      c.html("<p>No payment methods found.</p>");
    }
  });
}

function openAddPaymentMethodForm() {
  const tpl   = document.getElementById("add-payment-template");
  const clone = tpl.content.cloneNode(true);
  $("#payment-methods").html(clone);
}

function addPaymentMethod() {
  const method = $("#new-payment-method").val();
  $.ajax({
    url: "../../backend/api/ApiGuest.php?addPayment",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ method }),
    success(response) {
      if (response.success) {
        showMessage("success", "Payment method added.");
        loadPaymentMethods();
      } else {
        showMessage("danger", response.error || "Addition failed.");
      }
    },
    error(xhr) {
      showMessage("danger", xhr.responseJSON?.error || "An error occurred.");
    }
  });
}

// === Orders ===
function loadOrders() {
  $.get("../../backend/api/ApiOrder.php?orders", function(orders) {
    const c = $("#order-list").empty();
    if (!orders.length) {
      c.html("<p>You have no orders.</p>");
      return;
    }
    orders.forEach(o => {
      const html = `
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
      `;
      c.append(html);
    });
  });
}

function viewOrderDetails(orderId) {
  $.get(`../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`, function(res) {
    // Header‑Infos
    $("#modal-order-id").text(res.order.id);
    $("#modal-order-date").text(res.order.created_at);
    $("#modal-subtotal").text(res.order.subtotal);
    $("#modal-discount").text(res.order.discount);
    $("#modal-shipping").text(res.order.shipping_amount);
    $("#modal-total").text(res.order.total_amount);

    // Positionen
    const body = $("#modal-items-body").empty();
    res.items.forEach(item => {
      const row = `
        <tr>
          <td>${item.name_snapshot}</td>
          <td>€${item.price_snapshot}</td>
          <td>${item.quantity}</td>
          <td>€${item.total_price}</td>
        </tr>
      `;
      body.append(row);
    });

    // Modal öffnen
    const modal = new bootstrap.Modal(document.getElementById("orderDetailsModal"));
    modal.show();
  })
  .fail(() => showMessage("danger", "Could not load order details."));
}


function downloadInvoice(orderId) {
  window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, "_blank");
}


function changePassword() {
  const oldP = $("#old_password").val().trim(),
        newP = $("#new_password").val().trim();

  $.ajax({
    url: "../../backend/api/ApiAccount.php?password",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ old_password: oldP, new_password: newP }),
    success(response) {
      if (response.success) {
        showMessage("success", "Password updated successfully.");
        $("#old_password,#new_password,#confirm_password")
          .val("")
          .removeClass("is-valid is-invalid")
          .each((_, el) => el.setCustomValidity(""));
      } else {
        showMessage("danger", response.error || "Password update failed.");
      }
    },
    error(xhr) {
      showMessage("danger", xhr.responseJSON?.error || "An error occurred.");
    }
  });
}
