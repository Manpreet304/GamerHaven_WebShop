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
        let payment_info = "";

        // Daten für die gewählte Zahlungsmethode sammeln
        if (method === "Credit Card") {
            const card = $("#card_number").val().trim();
            const csv = $("#csv").val().trim();
            if (!card || !csv) {
                showMessage("error", "Please fill in card number and CSV.");
                return;
            }
            payment_info = `${card}|${csv}`;
        } else if (method === "PayPal") {
            const email = $("#paypal_email").val().trim();
            const user = $("#paypal_username").val().trim();
            if (!email || !user) {
                showMessage("error", "Please fill in PayPal email and username.");
                return;
            }
            payment_info = `${email}|${user}`;
        } else if (method === "Bank Transfer") {
            const iban = $("#iban").val().trim();
            const bic = $("#bic").val().trim();
            if (!iban || !bic) {
                showMessage("error", "Please fill in IBAN and BIC.");
                return;
            }
            payment_info = `${iban}|${bic}`;
        }

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
            payment_method: method,
            payment_info: payment_info
        };

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
