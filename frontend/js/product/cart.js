// cart.js

$(document).ready(function () {
  loadCart();
  updateCartCount();

  // Tooltips initialisieren
  $('[data-bs-toggle="tooltip"]').each((_, el) =>
    new bootstrap.Tooltip(el)
  );

  // Proceed to Checkout
  $(document).on("click", "#proceedToCheckout", function (e) {
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
      onSuccess: res => {
        window.open(`../../backend/invoices/Invoice.php?orderId=${res.data?.body?.orderId || res.data?.orderId}`, "_blank");
        setTimeout(() => window.location.href = "homepage.html", 3000);
      },
      errorMessage: "Order could not be completed."
    });
  });

  // Update quantity
  $(document).on("change", ".quantity-input", function () {
    const tr       = $(this).closest("tr");
    const cartId   = tr.data("id");
    const quantity = parseInt($(this).val(), 10);
    if (quantity < 1) return;

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
  apiRequest({
    url: "../../backend/api/ApiCart.php",
    onSuccess: resp => {
      const body     = resp.data?.body || {};
      const items    = body.items    || [];
      const shipping = body.shipping ?? 0;
      const total    = body.total    ?? 0;

      const tbody = $("#cart-items");
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
        const clone = document.getElementById("cart-item-template").content.cloneNode(true);
        const row   = $(clone).find("tr");
        row.attr("data-id", item.id);
        row.find(".cart-name").text(item.name);
        row.find(".cart-price").text(`€${item.price.toFixed(2)}`);
        row.find(".cart-subtotal").text(
          `€${(item.price * item.quantity).toFixed(2)}`
        );
        row.find(".quantity-input").val(item.quantity);
        tbody.append(row);
      });

      $("#shipping-price").text(
        shipping === 0 ? "Free" : `€${shipping.toFixed(2)}`
      );
      $("#total-price").text(`€${total.toFixed(2)}`);
    }
  });
}

function loadCheckoutSummary() {
  apiRequest({
    url: "../../backend/api/ApiCart.php",
    onSuccess: resp => {
      const body     = resp.data?.body || {};
      const items    = body.items    || [];
      const subtotal = body.subtotal || 0;
      const shipping = body.shipping || 0;
      const total    = body.total    || 0;

      const list = $("#checkout-cart-items").empty();
      const tpl  = document.getElementById("checkout-item-template");

      items.forEach(item => {
        const lineSubtotal = item.price * item.quantity;
        const clone        = tpl.content.cloneNode(true);
        $(clone).find(".item-name").text(item.name);
        $(clone).find(".item-details").text(
          `Quantity: ${item.quantity} × €${item.price.toFixed(2)}`
        );
        $(clone).find(".item-subtotal").text(`€${lineSubtotal.toFixed(2)}`);
        list.append(clone);
      });

      updatePriceDisplay(subtotal, shipping, total);
    }
  });
}

function loadPaymentMethods() {
  apiRequest({
    url: "../../backend/api/ApiGuest.php?me",
    onSuccess: resp => {
      const user     = resp.data?.body || resp.data || {};
      const select   = $("#paymentMethod").empty()
                          .append('<option value="">Choose payment method</option>');

      const payments = Array.isArray(user.payments) ? user.payments : [];
      if (payments.length) {
        payments.forEach(p => {
          let label = p.method;
          if (p.method === "Credit Card")  label += ` (****${p.last_digits})`;
          if (p.method === "PayPal")       label += ` (${p.paypal_email})`;
          if (p.method === "Bank Transfer") label += ` (IBAN ****${p.iban.slice(-4)})`;
          select.append(`<option value="${p.id}">${label}</option>`);
        });
      } else {
        select.append('<option disabled>No payment methods found</option>');
      }
    }
  });
}

function updatePriceDisplay(sub, ship, total) {
  $("#checkout-subtotal").text(`€${sub.toFixed(2)}`);
  $("#checkout-shipping").text(
    ship === 0 ? "Free" : `€${ship.toFixed(2)}`
  );
  $("#checkout-total").text(`€${total.toFixed(2)}`);
}