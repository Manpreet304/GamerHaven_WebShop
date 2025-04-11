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

    // === Zahlungsdetails anzeigen je nach Auswahl ===
    $("#payment_method").on("change", function () {
        const selected = $(this).val();
        $("#paymentDetailsWrapper").toggle(selected !== "");
        $("#creditFields, #paypalFields, #bankFields").hide();

        if (selected === "Credit Card") $("#creditFields").show();
        else if (selected === "PayPal") $("#paypalFields").show();
        else if (selected === "Bank Transfer") $("#bankFields").show();
    });

    // === Formular absenden ===
    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

        // Vorherige Validierung zurücksetzen
        $("#registerForm input, #registerForm select").each(function () {
            $(this).removeClass("is-valid is-invalid")[0].setCustomValidity("");
        });

        const data = getFormData();
        if (!validatePaymentFields(data)) return;

        $.ajax({
            url: "/GamerHaven_WebShop/backend/api/api_guest.php?register",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                console.log("Response:", response);
                if (response.success) {
                    showMessage("success", "Registration successful! Redirecting...");
                    setTimeout(() => {
                        window.location.href = "../website/login.html";
                    }, 3000);
                }
            },            
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || "Registration failed.";
                handleValidationErrors(msg);
                $("#registerForm").addClass("was-validated");
            }
        });
    });

    // === Bootstrap-eigene Formularvalidierung aktivieren ===
    (function () {
        const form = document.getElementById("registerForm");
        form.addEventListener("submit", function (event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add("was-validated");
        }, false);
    })();

    // === Tooltips aktivieren ===
    const tooltipList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipList.forEach(el => new bootstrap.Tooltip(el));
});

// === Hilfsfunktionen ===

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
        setFieldError("#card_number", "Card number is required.");
        setFieldError("#csv", "CSV is required.");
        return false;
    }

    if (data.payment_method === "PayPal" && (!data.paypal_email || !data.paypal_username)) {
        setFieldError("#paypal_email", "PayPal email is required.");
        setFieldError("#paypal_username", "PayPal username is required.");
        return false;
    }

    if (data.payment_method === "Bank Transfer" && (!data.iban || !data.bic)) {
        setFieldError("#iban", "IBAN is required.");
        setFieldError("#bic", "BIC is required.");
        return false;
    }

    return true;
}

function handleValidationErrors(msg) {
    if (msg.includes("Username")) setFieldError("#username", msg);
    if (msg.includes("Password must")) setFieldError("#password", msg);
    if (msg.includes("Passwords do not match")) setFieldError("#password2", msg);
    if (msg.includes("Invalid email")) setFieldError("#email", msg);
}
