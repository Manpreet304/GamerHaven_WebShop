// /user/register.js

$(document).ready(function () {

  // Dropdown mit Ländern initialisieren
  initCountryDropdown();

  // Zeigt/versteckt Zahlungsmethoden
  initPaymentMethodToggle();

  // Bootstrap-Tooltips aktivieren
  initTooltips();

  // Wenn das Registrierungsformular abgeschickt wird
  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const form = this;
    form.classList.remove("was-validated");

    const data = getFormData();

    // Prüfen ob Zahlungfelder korrekt ausgefüllt wurden
    if (!validatePaymentFields(data)) {
      showMessage("danger", "Please fill all required payment fields.");
      return;
    }

    // Formular-Validierung prüfen
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Registrierung abschicken
    registerUser(data);
  });

});

// Sendet die Registrierungsdaten an den Server
function registerUser(data) {
  $.ajax({
    url: "../../backend/api/ApiGuest.php?register",
    method: "POST",
    dataType: "json",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: function (response) {
      handleResponse(response, {
        successMessage: "Registration successful! Redirecting...",
        formSelector: "#registerForm",
        showValidation: true,
        onSuccess: function () {
          setTimeout(function () {
            window.location.href = "../website/login.html"; // Weiterleitung zur Login-Seite
          }, 3000);
        }
      });
    },
    error: function (xhr) {
      handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Registration failed. Please check your data.",
        formSelector: "#registerForm",
        showValidation: true
      });
    }
  });
}

// Befüllt das Länder-Dropdown
function initCountryDropdown() {
  const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
    "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Belgium", "Brazil", "Bulgaria", "Canada", "Chile",
    "China", "Colombia", "Croatia", "Czech Republic", "Denmark",
    "Egypt", "Estonia", "Finland", "France", "Germany",
    "Greece", "Hungary", "India", "Indonesia", "Ireland",
    "Israel", "Italy", "Japan", "Kazakhstan", "Latvia",
    "Lithuania", "Luxembourg", "Mexico", "Netherlands", "New Zealand",
    "Norway", "Pakistan", "Peru", "Philippines", "Poland",
    "Portugal", "Romania", "Russia", "Saudi Arabia", "Serbia",
    "Singapore", "Slovakia", "Slovenia", "South Africa", "South Korea",
    "Spain", "Sweden", "Switzerland", "Thailand", "Turkey",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States",
    "Vietnam", "Zimbabwe"
  ];

  countries.forEach(function (country) {
    $("#country").append(new Option(country, country));
  });
}

// Steuert die Sichtbarkeit der Zahlungsfelder
function initPaymentMethodToggle() {
  $("#payment_method").on("change", function () {
    const selected = $(this).val();
    $("#paymentDetailsWrapper").toggle(!!selected);
    $("#creditFields, #paypalFields, #bankFields").hide();

    if (selected === "Credit Card") {
      $("#creditFields").show();
    } else if (selected === "PayPal") {
      $("#paypalFields").show();
    } else if (selected === "Bank Transfer") {
      $("#bankFields").show();
    }
  });
}

// Aktiviert alle Tooltips
function initTooltips() {
  $('[data-bs-toggle="tooltip"]').each(function (_, el) {
    new bootstrap.Tooltip(el);
  });
}

// Holt die Formular-Daten
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

// Prüft ob alle Pflichtfelder für die Zahlungsmethode ausgefüllt sind
function validatePaymentFields(data) {
  switch (data.payment_method) {
    case "Credit Card":
      return !!(data.card_number && data.csv);
    case "PayPal":
      return !!(data.paypal_email && data.paypal_username);
    case "Bank Transfer":
      return !!(data.iban && data.bic);
    default:
      return true;
  }
}
