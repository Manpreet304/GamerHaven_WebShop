function showMessage(type, text, target = "#messageBox") {
    const alertClass = type === "success" ? "alert-success" : "alert-danger";
    const message = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `);

    const container = $(target);
    container.find(".alert").alert("close");

    container.empty().append(message); 

    setTimeout(() => {
        container.find(".alert").alert("close");
    }, 5000);
}


function setFieldError(selector, message) {
    const $field = $(selector);
    $field.addClass("is-invalid").removeClass("is-valid");
    $field[0].setCustomValidity("Invalid");

    const $feedback = $field.closest(".mb-3").find(".invalid-feedback");
    if ($feedback.length > 0) {
        $feedback.text(message).show();
    }
}

function setFieldValid(selector) {
    const $field = $(selector);
    $field.removeClass("is-invalid").addClass("is-valid");
    $field[0].setCustomValidity("");
}

function applyFieldErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
        setFieldError(`#${field}`, message);
    });
}

function updateCartCount() {
    $.get("../../backend/api/api_cart.php?cartCount", function (data) {
        $("#cart-count").text(data.count || 0);
    });
}

