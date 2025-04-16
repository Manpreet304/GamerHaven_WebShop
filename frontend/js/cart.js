$(document).ready(function () {
    loadCart();
    updateCartCount();

    // Proceed to Checkout
    $(document).on("click", "#proceedToCheckout", function () {
        $("#checkoutModal").modal("show");
        loadCheckoutSummary();
        loadPaymentMethods();
    });

    // Bestellung abschicken
    $(document).on("submit", "#checkout-form", function (e) {
        e.preventDefault();
        $("#checkout-form").removeClass("was-validated");

        const paymentId = parseInt($("#paymentMethod").val());
        const voucher = $("#voucher").val().trim() || null;

        if (!paymentId) {
            $("#checkout-form").addClass("was-validated");
            return;
        }

        $.ajax({
            url: "../../backend/api/api_order.php",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({ payment_id: paymentId, voucher }),
            success: function (response) {
                if (response.success) {
                    showMessage("success", "Your order was successfully placed!");
                    setTimeout(() => window.location.href = "homepage.html", 3000);
                } else {
                    showMessage("danger", "Order could not be completed. Please try again.");
                }
            },
            error: function (xhr) {
                const error = xhr.responseJSON?.error || "An error occurred.";
                showMessage("danger", error);
            }
        });
    });
});

function loadCart() {
    $.get("../../backend/api/api_cart.php", function (data) {
        const items = data.items || [];
        const tbody = $("#cart-items");
        const template = document.getElementById("cart-item-template");

        tbody.empty();

        if (!items.length) {
            tbody.append(`<tr><td colspan="5">Your cart is currently empty.</td></tr>`);
            $("#shipping-price").text("€0.00");
            $("#total-price").text("€0.00");
            return;
        }

        items.forEach(item => {
            const clone = template.content.cloneNode(true);
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

$(document).on("change", ".quantity-input", function () {
    const tr = $(this).closest("tr");
    const cartId = tr.data("id");
    const quantity = parseInt($(this).val());

    if (quantity < 1) return;

    $.ajax({
        url: "../../backend/api/api_cart.php",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ action: "update", id: cartId, quantity }),
        success: loadCart
    });
});

$(document).on("click", ".delete-item", function () {
    const tr = $(this).closest("tr");
    const cartId = tr.data("id");

    $.ajax({
        url: "../../backend/api/api_cart.php",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ action: "delete", id: cartId }),
        success: loadCart
    });
});

function updateCartCount() {
    $.get("/GamerHaven_WebShop/backend/api/api_cart.php?cartCount", function (data) {
        $("#cart-count").text(data.count || 0);
    });
}

// === Checkout-Modalfunktionen ===
function loadCheckoutSummary() {
    $.get("../../backend/api/api_cart.php", function (data) {
        const list = $("#checkout-cart-items").empty();
        const template = document.getElementById("checkout-item-template");
        const items = data.items || [];

        if (!items.length) {
            list.append(`<li class="list-group-item">Your cart is empty.</li>`);
            updatePriceDisplay(0, 0, 0);
            return;
        }

        items.forEach(item => {
            const subtotal = item.price * item.quantity;
            const clone = template.content.cloneNode(true);
            $(clone).find(".item-name").text(item.name);
            $(clone).find(".item-details").text(`Quantity: ${item.quantity} × €${item.price.toFixed(2)}`);
            $(clone).find(".item-subtotal").text(`€${subtotal.toFixed(2)}`);
            list.append(clone);
        });

        updatePriceDisplay(data.subtotal, data.shipping, data.total);
    });
}

function loadPaymentMethods() {
    $.get("../../backend/api/api_guest.php?me", function (user) {
        const select = $("#paymentMethod");
        select.empty().append(`<option value="">Choose payment method</option>`);

        if (user?.payments?.length) {
            user.payments.forEach(p => {
                let label = p.method;
                if (p.method === "Credit Card" && p.last_digits)
                    label += ` (**** ${p.last_digits})`;
                else if (p.method === "PayPal" && p.paypal_email)
                    label += ` (${p.paypal_email})`;
                else if (p.method === "Bank Transfer" && p.iban)
                    label += ` (IBAN ****${p.iban.slice(-4)})`;

                select.append(`<option value="${p.id}" ${user.payment_id === p.id ? "selected" : ""}>${label}</option>`);
            });
        } else {
            select.append(`<option disabled>No payment methods found</option>`);
        }
    }).fail(() => showMessage("danger", "Unable to load payment methods."));
}

function updatePriceDisplay(subtotal, shipping, total) {
    $("#checkout-subtotal").text(`€${subtotal.toFixed(2)}`);
    $("#checkout-shipping").text(shipping === 0 ? "Free" : `€${shipping.toFixed(2)}`);
    $("#checkout-total").text(`€${total.toFixed(2)}`);
}
