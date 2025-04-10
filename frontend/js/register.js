$(document).ready(function () {

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

    const $countrySelect = $("#country");
    countries.forEach(country => {
        $countrySelect.append(new Option(country, country));
    });

    // Dynamisch Felder anzeigen je nach ausgewählter Zahlungsmethode
    $("#payment_method").on("change", function () {
        const selected = $(this).val();
        $("#paymentDetailsWrapper").show();
        $("#creditFields, #paypalFields, #bankFields").hide();

        if (selected === "Credit Card") {
            $("#creditFields").show();
        } else if (selected === "PayPal") {
            $("#paypalFields").show();
        } else if (selected === "Bank Transfer") {
            $("#bankFields").show();
        } else {
            $("#paymentDetailsWrapper").hide();
        }
    });

    // Formular absenden
    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

        // Passwortabgleich
        if ($("#password").val() !== $("#password2").val()) {
            showMessage("error", "Passwords do not match!");
            return;
        }

        const method = $("#payment_method").val();
        const data = {
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
            payment_method: method
        };

        // Zahlungsfelder einzeln hinzufügen und validieren
        if (method === "Credit Card") {
            const card = $("#card_number").val().trim();
            const csv = $("#csv").val().trim();
            if (!card || !csv) {
                showMessage("error", "Please fill in card number and CSV.");
                return;
            }
            data.card_number = card;
            data.csv = csv;
        } else if (method === "PayPal") {
            const paypalEmail = $("#paypal_email").val().trim();
            const paypalUser = $("#paypal_username").val().trim();
            if (!paypalEmail || !paypalUser) {
                showMessage("error", "Please fill in PayPal email and username.");
                return;
            }
            data.paypal_email = paypalEmail;
            data.paypal_username = paypalUser;
        } else if (method === "Bank Transfer") {
            const iban = $("#iban").val().trim();
            const bic = $("#bic").val().trim();
            if (!iban || !bic) {
                showMessage("error", "Please fill in IBAN and BIC.");
                return;
            }
            data.iban = iban;
            data.bic = bic;
        }

        $.ajax({
            url: "/Webproject_GamerHaven/backend/api/api_guest.php?register",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                showMessage("success", "Registration successful! You will be redirected to login...");
                setTimeout(() => {
                    window.location.href = "../website/login.html";
                }, 3000);
            },
            error: function (xhr) {
                const errorMsg = xhr.responseJSON?.error || "Registration failed. Please try again.";
                showMessage("error", errorMsg);
            }
        });
    });

    // Tooltip-Initialisierung
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
