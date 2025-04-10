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

    $("#payment_method").on("change", function () {
        const selected = $(this).val();
        const $wrapper = $("#paymentDetailsWrapper");
        const $label = $("#paymentDetailsLabel");
        const $input = $("#payment_info");

        if (!selected) {
            $wrapper.hide();
            $input.val("");
            return;
        }

        $wrapper.show();

        switch (selected) {
            case "Credit Card":
                $label.text("Card Number:");
                $input.attr("placeholder", "e.g., 4111 1111 1111 1111");
                break;
            case "PayPal":
                $label.text("PayPal Email:");
                $input.attr("placeholder", "e.g., yourmail@paypal.com");
                break;
            case "Bank Transfer":
                $label.text("IBAN + BIC:");
                $input.attr("placeholder", "e.g., AT61 1904 3002 3457 3201");
                break;
            default:
                $label.text("Details:");
                $input.attr("placeholder", "");
        }
    });

    function showMessage(type, text) {
        const alertClass = type === "success" ? "alert-success" : "alert-danger";
        const message = `
            <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                ${text}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>`;
    
        $("#messageBox").html(message);
    
        setTimeout(() => {
            $(".alert").alert("close");
        }, 5000);
    }

    $("#registerForm").on("submit", function (e) {
        e.preventDefault();

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
            payment_method: $("#payment_method").val(),
            payment_info: $("#payment_info").val()
        };

        if (data.password !== data.password2) {
            showMessage("error", "Passwords do not match!");
            return;
        }

        $.ajax({
            url: "/Webproject_GamerHaven/backend/api/api_guest.php?register",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
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

});
