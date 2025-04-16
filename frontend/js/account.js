$(document).ready(function () {
    loadAccountInfo();
    loadPaymentMethods();
    loadOrders();

    $("#edit-account-btn").on("click", function () {
        openAccountEditForm();
    });

    $("#add-payment-method-btn").on("click", function () {
        openAddPaymentMethodForm();
    });

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
        $("#account-info").html(`
            <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Address:</strong> ${user.address}, ${user.zip_code} ${user.city}, ${user.country}</p>
        `);
    });
}

function loadPaymentMethods() {
    $.get("../../backend/api/api_guest.php?me", function (user) {
        const container = $("#payment-methods").empty();

        if (user.payments && user.payments.length) {
            user.payments.forEach(p => {
                container.append(`
                    <div class="mb-3">
                        <p><strong>Method:</strong> ${p.method}</p>
                        ${p.method === "Credit Card" ? `<p><strong>Card:</strong> **** ${p.last_digits}</p>` : ""}
                        ${p.method === "PayPal" ? `<p><strong>Email:</strong> ${p.paypal_email}</p>` : ""}
                        ${p.method === "Bank Transfer" ? `<p><strong>IBAN:</strong> ****${p.iban.slice(-4)}</p>` : ""}
                        <button class="btn btn-sm btn-danger" onclick="removePaymentMethod(${p.id})">
                          <i class="bi bi-trash"></i> Remove
                        </button>
                    </div>
                `);
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
            container.append(`
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
                </div>
            `);
        });
    });
}

function openAccountEditForm() {
    $.get("../../backend/api/api_guest.php?me", function(user) {
        $("#account-info").html(`
            <form id="edit-account-form">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="first_name" class="form-label">First Name</label>
                        <input type="text" id="first_name" class="form-control" value="${user.first_name}" required>
                    </div>
                    <div class="col-md-6">
                        <label for="last_name" class="form-label">Last Name</label>
                        <input type="text" id="last_name" class="form-control" value="${user.last_name}" required>
                    </div>
                    <div class="col-md-6">
                        <label for="email" class="form-label">Email</label>
                        <input type="email" id="email" class="form-control" value="${user.email}" required>
                    </div>
                    <div class="col-md-6">
                        <label for="password" class="form-label">Password</label>
                        <input type="password" id="password" class="form-control" placeholder="Enter password to confirm changes" required>
                    </div>
                    <div class="col-md-12">
                        <label for="address" class="form-label">Address</label>
                        <input type="text" id="address" class="form-control" value="${user.address}">
                    </div>
                    <div class="col-md-4">
                        <label for="zip_code" class="form-label">Zip Code</label>
                        <input type="text" id="zip_code" class="form-control" value="${user.zip_code}">
                    </div>
                    <div class="col-md-4">
                        <label for="city" class="form-label">City</label>
                        <input type="text" id="city" class="form-control" value="${user.city}">
                    </div>
                    <div class="col-md-4">
                        <label for="country" class="form-label">Country</label>
                        <input type="text" id="country" class="form-control" value="${user.country}">
                    </div>
                </div>
                <div class="mt-4">
                    <button type="submit" class="btn btn-primary"><i class="bi bi-save"></i> Save Changes</button>
                </div>
            </form>
        `);
    });
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