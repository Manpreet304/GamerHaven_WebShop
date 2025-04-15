$(document).ready(function () {
    loadCartSummary();
    loadPaymentMethods();

    $("#checkout-form").on("submit", function (e) {
        e.preventDefault();

        // Reset Validierung
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

function loadCartSummary() {
    $.ajax({
        url: "../../backend/api/api_cart.php",
        method: "GET",
        success: function (data) {
            const list = $("#checkout-cart-items");
            list.empty();

            const items = data.items || [];
            if (!items.length) {
                list.append(`<li class="list-group-item">Your cart is empty.</li>`);
                updatePriceDisplay(0, 0, 0);
                return;
            }

            items.forEach(item => {
                const subtotal = item.price * item.quantity;
                list.append(`
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${item.name}</strong><br>
                            Quantity: ${item.quantity} × €${item.price.toFixed(2)}
                        </div>
                        <span class="fw-bold">€${subtotal.toFixed(2)}</span>
                    </li>
                `);
            });

            updatePriceDisplay(data.subtotal, data.shipping, data.total);
        },
        error: function () {
            showMessage("danger", "Could not load your cart.");
        }
    });
}

function updatePriceDisplay(subtotal, shipping, total) {
    $("#checkout-subtotal").text(`€${subtotal.toFixed(2)}`);
    $("#checkout-shipping").text(shipping === 0 ? "Free" : `€${shipping.toFixed(2)}`);
    $("#checkout-total").text(`€${total.toFixed(2)}`);
}

function loadPaymentMethods() {
    $.get("/GamerHaven_WebShop/backend/api/api_guest.php?me", function (user) {
        const select = $("#paymentMethod");
        select.empty().append(`<option value="">Choose payment method</option>`);

        if (user && user.payments && user.payments.length) {
            user.payments.forEach(p => {
                const selected = user.payment_id === p.id ? "selected" : "";
                let label = p.method;
                if (p.method === "Credit Card" && p.last_digits) {
                    label += ` (**** ${p.last_digits})`;
                } else if (p.method === "PayPal" && p.paypal_email) {
                    label += ` (${p.paypal_email})`;
                } else if (p.method === "Bank Transfer" && p.iban) {
                    label += ` (IBAN ****${p.iban.slice(-4)})`;
                }
                select.append(`<option value="${p.id}" ${selected}>${label}</option>`);
            });
        } else {
            select.append(`<option disabled>No payment methods found</option>`);
        }
    }).fail(() => {
        showMessage("danger", "Unable to load payment methods.");
    });
}
