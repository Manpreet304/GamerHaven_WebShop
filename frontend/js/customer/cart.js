// /customer/cart.js

$(document).ready(function () {
  loadCart();
  updateCartCount();

  // Tooltips aktivieren
  $('[data-bs-toggle="tooltip"]').each(function (_, el) {
    new bootstrap.Tooltip(el);
  });

  // "Proceed to Checkout" klicken
  $(document).on("click", "#proceedToCheckout", function () {
    if ($(this).prop("disabled")) {
      showMessage("danger", "Your cart is empty. Please add products before proceeding.");
      return;
    }
    $("#checkoutModal").modal("show");
    loadCheckoutSummary();
    loadPaymentMethods();
  });

  // Checkout-Formular absenden
  $(document).on("submit", "#checkout-form", function (e) {
    e.preventDefault();
    const form = this;
    form.classList.remove("was-validated");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const paymentId = parseInt($("#paymentMethod").val(), 10);
    const voucher = $("#voucher").val().trim() || null;

    $.ajax({
      url: "../../backend/api/ApiOrder.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ payment_id: paymentId, voucher: voucher }),
      success: function (res) {
        handleResponse(res, {
          successMessage: "Order placed successfully! Invoice opens in a new tab.",
          onSuccess: function () {
            window.open(`../../backend/invoices/Invoice.php?orderId=${res.orderId}`, "_blank");
            setTimeout(function () {
              window.location.href = "homepage.html";
            }, 3000);
          }
        });
      },
      error: function (xhr) {
        handleResponse(xhr.responseJSON || {}, {
          errorMessage: "Order could not be completed."
        });
      }
    });
  });

  // Menge im Warenkorb ändern
  $(document).on("change", ".quantity-input", function () {
    const tr = $(this).closest("tr");
    const cartId = tr.data("id");
    const quantity = parseInt($(this).val(), 10);

    if (quantity < 1) return;

    $.ajax({
      url: "../../backend/api/ApiCart.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ action: "update", id: cartId, quantity: quantity }),
      success: loadCart
    });
  });

  // Artikel aus Warenkorb löschen
  $(document).on("click", ".delete-item", function () {
    const cartId = $(this).closest("tr").data("id");

    $.ajax({
      url: "../../backend/api/ApiCart.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ action: "delete", id: cartId }),
      success: loadCart
    });
  });
});

// ---------------------- FUNKTIONEN ----------------------

/**
 * Lädt die aktuellen Warenkorb-Daten
 */
function loadCart() {
  $.get("../../backend/api/ApiCart.php", function (data) {
    const items = data.items || [];
    const tbody = $("#cart-items");
    const tpl = document.getElementById("cart-item-template");

    tbody.empty();

    if (!items.length) {
      tbody.append('<tr><td colspan="5">Your cart is currently empty.</td></tr>');
      $("#shipping-price").text("€0.00");
      $("#total-price").text("€0.00");
      $("#proceedToCheckout").prop("disabled", true);
      return;
    }

    $("#proceedToCheckout").prop("disabled", false);

    items.forEach(function (item) {
      const clone = tpl.content.cloneNode(true);
      const row = $(clone).find("tr");
      row.attr("data-id", item.id);
      row.find(".cart-name").text(item.name);
      row.find(".cart-price").text(`€${item.price.toFixed(2)}`);
      row.find(".cart-subtotal").text(`€${(item.price * item.quantity).toFixed(2)}`);
      row.find(".quantity-input").val(item.quantity);
      tbody.append(row);
    });

    $("#shipping-price").text(data.shipping === 0 ? "Free" : `€${data.shipping.toFixed(2)}`);
    $("#total-price").text(`€${data.total.toFixed(2)}`);
  });
}

/**
 * Lädt die Warenkorb-Zusammenfassung für Checkout
 */
function loadCheckoutSummary() {
  $.get("../../backend/api/ApiCart.php", function (data) {
    const list = $("#checkout-cart-items").empty();
    const tpl = document.getElementById("checkout-item-template");
    const items = data.items || [];

    if (!items.length) {
      list.append('<li class="list-group-item">Your cart is empty.</li>');
      updatePriceDisplay(0, 0, 0);
      return;
    }

    items.forEach(function (item) {
      const subtotal = item.price * item.quantity;
      const clone = tpl.content.cloneNode(true);
      $(clone).find(".item-name").text(item.name);
      $(clone).find(".item-details").text(`Quantity: ${item.quantity} × €${item.price.toFixed(2)}`);
      $(clone).find(".item-subtotal").text(`€${subtotal.toFixed(2)}`);
      list.append(clone);
    });

    updatePriceDisplay(data.subtotal, data.shipping, data.total);
  });
}

/**
 * Lädt die Zahlungsarten des Nutzers
 */
function loadPaymentMethods() {
  $.get("../../backend/api/ApiGuest.php?me", function (user) {
    const select = $("#paymentMethod").empty().append('<option value="">Choose payment method</option>');

    if (user.payments?.length) {
      user.payments.forEach(function (p) {
        let label = p.method;
        if (p.method === "Credit Card") label += ` (****${p.last_digits})`;
        if (p.method === "PayPal") label += ` (${p.paypal_email})`;
        if (p.method === "Bank Transfer") label += ` (IBAN ****${p.iban.slice(-4)})`;

        select.append(`<option value="${p.id}">${label}</option>`);
      });
    } else {
      select.append('<option disabled>No payment methods found</option>');
    }
  });
}

/**
 * Aktualisiert die Preisübersicht im Checkout
 */
function updatePriceDisplay(sub, ship, total) {
  $("#checkout-subtotal").text(`€${sub.toFixed(2)}`);
  $("#checkout-shipping").text(ship === 0 ? "Free" : `€${ship.toFixed(2)}`);
  $("#checkout-total").text(`€${total.toFixed(2)}`);
}
