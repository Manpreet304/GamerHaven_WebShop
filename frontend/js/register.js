$(document).ready(function () {
    // === Länder-Dropdown befüllen ===
    const countries = [
        "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
        "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
        "Belgium", "Brazil", "Bulgaria", "Canada", "China", "Colombia", "Croatia", "Cuba",
        "Czech Republic", "Denmark", "Egypt", "Estonia", "Finland", "France", "Germany",
        "Greece", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
        "Italy", "Japan", "Kenya", "Latvia", "Lithuania", "Luxembourg", "Malaysia", "Mexico",
        "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Philippines", "Poland",
        "Portugal", "Romania", "Russia", "Saudi Arabia", "Serbia", "Singapore", "Slovakia",
        "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland",
        "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
        "Vietnam", "Zimbabwe"
    ];
    countries.forEach(country => {
        $("#country").append(new Option(country, country));
    });

    $("#payment_method").on("change", function () {
        const selected = $(this).val();
        $("#paymentDetailsWrapper").toggle(selected !== "");
        $("#creditFields, #paypalFields, #bankFields").hide();

        if (selected === "Credit Card") $("#creditFields").show();
        else if (selected === "PayPal") $("#paypalFields").show();
        else if (selected === "Bank Transfer") $("#bankFields").show();
    });

    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

        $("#registerForm input, #registerForm select").each(function () {
            $(this).removeClass("is-valid is-invalid")[0].setCustomValidity("");
        });

        const data = getFormData();
        if (!validatePaymentFields(data)) return;

        const form = document.getElementById("registerForm");
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        $.ajax({
            url: "/GamerHaven_WebShop/backend/api/api_guest.php?register",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                if (response.success) {
                    showMessage("success", "Registration successful! Redirecting...");
                    setTimeout(() => {
                        window.location.href = "../website/login.html";
                    }, 3000);
                }
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.errors || { general: "Registration failed." };
                if (msg.general) showMessage("danger", msg.general);
                applyFieldErrors(msg);
                $("#registerForm").addClass("was-validated");
            }
        });
    });

    const tooltipList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipList.forEach(el => new bootstrap.Tooltip(el));
});

function getFormData() {
    return {
        salutation: $("#salutation").val(),
        first_name: $("#first_name").val(),
        last_name: $("#last_name").val(),
        address: $("#address").val(),
        zip: $("#zip").val(),
        city: $("#city").val(),
        country: $("#country").val(),
        email: $("#email").val(),
        username: $("#username").val(),
        password: $("#password").val(),
        password2: $("#password2").val(),
        payment_method: $("#payment_method").val(),
        card_number: $("#card_number").val().trim(),
        csv: $("#csv").val().trim(),
        paypal_email: $("#paypal_email").val().trim(),
        paypal_username: $("#paypal_username").val().trim(),
        iban: $("#iban").val().trim(),
        bic: $("#bic").val().trim()
    };
}

function validatePaymentFields(data) {
    if (data.payment_method === "Credit Card" && (!data.card_number || !data.csv)) {
        if (!data.card_number) setFieldError("#card_number", "Card number is required.");
        if (!data.csv) setFieldError("#csv", "CSV is required.");
        return false;
    }

    if (data.payment_method === "PayPal" && (!data.paypal_email || !data.paypal_username)) {
        if (!data.paypal_email) setFieldError("#paypal_email", "PayPal email is required.");
        if (!data.paypal_username) setFieldError("#paypal_username", "PayPal username is required.");
        return false;
    }

    if (data.payment_method === "Bank Transfer" && (!data.iban || !data.bic)) {
        if (!data.iban) setFieldError("#iban", "IBAN is required.");
        if (!data.bic) setFieldError("#bic", "BIC is required.");
        return false;
    }

    return true;
}