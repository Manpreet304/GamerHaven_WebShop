$(document).ready(function () {
    loadAccountInfo();
    loadPaymentMethods();
    loadOrders();

    $("#edit-account-btn").on("click", openAccountEditForm);
    $("#add-payment-method-btn").on("click", openAddPaymentMethodForm);

    $(document).on("submit", "#edit-account-form", function (e) {
        e.preventDefault();
        updateAccountInfo();
    });

    $(document).on("submit", "#add-payment-method-form", function (e) {
        e.preventDefault();
        addPaymentMethod();
    });
});

function loadAccountInfo() {
    $.get("../../backend/api/api_guest.php?me", function(user) {
        const info = `
            <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Address:</strong> ${user.address}, ${user.zip_code} ${user.city}, ${user.country}</p>`;
        $("#account-info").html(info);
    });
}

function loadPaymentMethods() {
    $.get("../../backend/api/api_guest.php?me", function (user) {
        const container = $("#payment-methods").empty();
        if (user.payments?.length) {
            user.payments.forEach(p => {
                const html = `
                    <div class="mb-3">
                        <p><strong>Method:</strong> ${p.method}</p>
                        ${p.method === "Credit Card" ? `<p><strong>Card:</strong> **** ${p.last_digits}</p>` : ""}
                        ${p.method === "PayPal" ? `<p><strong>Email:</strong> ${p.paypal_email}</p>` : ""}
                        ${p.method === "Bank Transfer" ? `<p><strong>IBAN:</strong> ****${p.iban.slice(-4)}</p>` : ""}
                        <button class="btn btn-sm btn-danger" onclick="removePaymentMethod(${p.id})">
                          <i class="bi bi-trash"></i> Remove
                        </button>
                    </div>`;
                container.append(html);
            });
        } else {
            container.html("<p>No payment methods found.</p>");
        }
    });
}

function loadOrders() {
    $.get("../../backend/api/api_order.php?orders", function (orders) {
        const container = $("#order-list").empty();
        if (!orders.length) {
            container.html("<p>You have no orders.</p>");
            return;
        }

        orders.forEach(order => {
            const html = `
                <div class="border rounded p-3 mb-3 bg-light">
                    <h6>Order #${order.id} - <small>${order.created_at}</small></h6>
                    <p><strong>Total:</strong> €${order.total_amount}</p>
                    <p><strong>Shipping:</strong> €${order.shipping_amount}</p>
                    <button class="btn btn-info btn-sm" onclick="viewOrderDetails(${order.id})">
                      <i class="bi bi-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="downloadInvoice(${order.id})">
                      <i class="bi bi-printer"></i> Download Invoice
                    </button>
                </div>`;
            container.append(html);
        });
    });
}

function openAccountEditForm() {
    $.get("../../backend/api/api_guest.php?me", function(user) {
        const template = document.getElementById("account-edit-template");
        const clone = template.content.cloneNode(true);
        clone.querySelector("#first_name").value = user.first_name;
        clone.querySelector("#last_name").value = user.last_name;
        clone.querySelector("#email").value = user.email;
        clone.querySelector("#address").value = user.address;
        clone.querySelector("#zip_code").value = user.zip_code;
        clone.querySelector("#city").value = user.city;
        clone.querySelector("#country").value = user.country;
        $("#account-info").html(clone);
    });
}

function openAddPaymentMethodForm() {
    const template = document.getElementById("add-payment-template");
    const clone = template.content.cloneNode(true);
    $("#payment-methods").html(clone);
}

function updateAccountInfo() {
    const data = {
        first_name: $("#first_name").val(),
        last_name: $("#last_name").val(),
        email: $("#email").val(),
        address: $("#address").val(),
        zip_code: $("#zip_code").val(),
        city: $("#city").val(),
        country: $("#country").val(),
        password: $("#password").val(),
    };

    $.ajax({
        url: "../../backend/api/api_account.php?update",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            if (response.success) {
                showMessage("success", "Account updated successfully.");
                loadAccountInfo();
            } else {
                showMessage("danger", "Update failed.");
            }
        }
    });
}

function removePaymentMethod(id) {
    $.ajax({
        url: "../../backend/api/api_guest.php?removePayment",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ paymentId: id }),
        success: function (response) {
            if (response.success) {
                showMessage("success", "Payment method removed.");
                loadPaymentMethods();
            } else {
                showMessage("danger", "Removal failed.");
            }
        }
    });
}

function downloadInvoice(orderId) {
    window.open(`../../backend/invoices/invoice_${orderId}.pdf`, '_blank');
}

function viewOrderDetails(orderId) {
    window.location.href = `order_details.html?orderId=${orderId}`;
}
