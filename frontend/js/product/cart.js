$(document).ready(function () {
  loadCart();

  // Tooltips initialisieren
  $('[data-bs-toggle="tooltip"]').each((_, el) =>
    new bootstrap.Tooltip(el)
  );

  // Proceed to Checkout
  $(document).on("click", "#proceedToCheckout", function () {
    if ($(this).prop("disabled")) return;
    $("#checkoutModal").modal("show");
    loadCheckoutSummary();
    loadPaymentMethods();
  });

  // Submit Checkout
  $(document).on("submit", "#checkout-form", function (e) {
    e.preventDefault();
    const form = this;
    form.classList.remove("was-validated");

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const paymentId = parseInt($("#paymentMethod").val(), 10);
    const voucher   = $("#voucher").val().trim() || null;

    apiRequest({
      url: "../../backend/api/ApiOrder.php",
      method: "POST",
      data: { payment_id: paymentId, voucher },
      successMessage: "Your order was successfully placed! Invoice opens in new tab.",
      errorMessage:   "Order could not be completed.",
      onSuccess: res => {
        window.open(`../../backend/invoices/Invoice.php?orderId=${res.orderId}`, "_blank");
        setTimeout(() => window.location.href = "homepage.html", 3000);
      }
    });
  });

  // Update quantity, niemals unter 1
  $(document).on("change", ".quantity-input", function () {
    let quantity = parseInt($(this).val(), 10);
    if (isNaN(quantity) || quantity < 1) {
      quantity = 1;
      $(this).val(1);
    }

    const tr     = $(this).closest("tr");
    const cartId = tr.data("id");

    apiRequest({
      url: "../../backend/api/ApiCart.php",
      method: "POST",
      data: { action: "update", id: cartId, quantity },
      onSuccess: () => {
        loadCart();
        updateCartCount();
      }
    });
  });

  // Delete item
  $(document).on("click", ".delete-item", function () {
    const cartId = $(this).closest("tr").data("id");

    apiRequest({
      url: "../../backend/api/ApiCart.php",
      method: "POST",
      data: { action: "delete", id: cartId },
      onSuccess: () => {
        loadCart();
        updateCartCount();
      }
    });
  });
});

// ---------------------- FUNCTIONS ----------------------

function loadCart() {
  $.ajax({
    url: "../../backend/api/ApiCart.php",
    method: "GET",
    dataType: "json",
    xhrFields: { withCredentials: true }
  })
    .done(res => {
      if (!res.success) {
        showMessage("danger", "Could not load cart.");
        return;
      }
      const payload = res.data.body;
      const items   = payload.items || [];
      const tbody   = $("#cart-items");
      const tpl     = document.getElementById("cart-item-template");
      tbody.empty();

      if (!items.length) {
        tbody.append(
          '<tr><td colspan="5">Your cart is currently empty. Add at least one product to proceed.</td></tr>'
        );
        $("#shipping-price").text("€0.00");
        $("#total-price").text("€0.00");
        $("#proceedToCheckout").prop("disabled", true);
        return;
      }

      $("#proceedToCheckout").prop("disabled", false);

      items.forEach(item => {
        const clone = tpl.content.cloneNode(true);
        const row   = $(clone).find("tr");
        row.attr("data-id", item.id);
        row.find(".cart-name").text(item.name);
        row.find(".cart-price").text(`€${item.price.toFixed(2)}`);
        row.find(".cart-subtotal").text(`€${(item.price * item.quantity).toFixed(2)}`);

        // Mengen-Input auf Minimum 1 festlegen
        const $qty = row.find(".quantity-input");
        $qty.attr("min", 1)
            .val(item.quantity);

        tbody.append(row);
      });

      $("#shipping-price").text(
        payload.shipping === 0 ? "Free" : `€${payload.shipping.toFixed(2)}`
      );
      $("#total-price").text(`€${payload.total.toFixed(2)}`);
    })
    .fail(() => {
      showMessage("danger", "Could not load cart. Are you logged in?");
    });
}

function loadCheckoutSummary() {
  $.ajax({
    url: "../../backend/api/ApiCart.php",
    method: "GET",
    dataType: "json",
    xhrFields: { withCredentials: true }
  })
    .done(res => {
      if (!res.success) {
        showMessage("danger", "Failed to load checkout summary.");
        return;
      }
      const payload = res.data.body;
      const list    = $("#checkout-cart-items").empty();
      const tpl     = document.getElementById("checkout-item-template");
      const items   = payload.items || [];

      items.forEach(item => {
        const subtotal = item.price * item.quantity;
        const clone    = tpl.content.cloneNode(true);
        $(clone).find(".item-name").text(item.name);
        $(clone).find(".item-details").text(
          `Quantity: ${item.quantity} × €${item.price.toFixed(2)}`
        );
        $(clone).find(".item-subtotal").text(`€${subtotal.toFixed(2)}`);
        list.append(clone);
      });

      updatePriceDisplay(payload.subtotal, payload.shipping, payload.total);
    })
    .fail(() => {
      showMessage("danger", "Failed to load checkout summary.");
    });
}

function loadPaymentMethods() {
  $.ajax({
    url: "../../backend/api/ApiGuest.php?me",
    method: "GET",
    dataType: "json",
    xhrFields: { withCredentials: true }
  })
    .done(res => {
      if (!res.success) {
        showMessage("danger", "Failed to load payment methods.");
        return;
      }
      const user   = res.data;
      const select = $("#paymentMethod").empty()
        .append('<option value="">Choose payment method</option>');

      if (user.payments?.length) {
        user.payments.forEach(p => {
          let label = p.method;
          if (p.method === "Credit Card")  label += ` (****${p.last_digits})`;
          if (p.method === "PayPal")       label += ` (${p.paypal_email})`;
          if (p.method === "Bank Transfer") label += ` (IBAN ****${p.iban.slice(-4)})`;
          select.append(`<option value="${p.id}">${label}</option>`);
        });
      } else {
        select.append('<option disabled>No payment methods found</option>');
      }
    })
    .fail(() => {
      showMessage("danger", "Failed to load payment methods.");
    });
}

function updatePriceDisplay(sub, ship, total) {
  $("#checkout-subtotal").text(`€${sub.toFixed(2)}`);
  $("#checkout-shipping").text(
    ship === 0 ? "Free" : `€${ship.toFixed(2)}`
  );
  $("#checkout-total").text(`€${total.toFixed(2)}`);
}
