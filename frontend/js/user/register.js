$(document).ready(function () {
  initCountryDropdown();
  initPaymentMethodToggle();
  initTooltips();

  $("#registerForm").on("submit", function (e) {
    e.preventDefault();

    const formEl = this;
    formEl.classList.remove("was-validated");
    clearValidation(formEl);

    const data = getFormData();
    if (!validatePaymentFields(data)) return;

    if (!formEl.checkValidity()) {
      formEl.classList.add("was-validated");
      return;
    }

    registerUser(data);
  });
});

function registerUser(data) {
  apiRequest({
    url: "../../backend/api/ApiGuest.php?register",
    method: "POST",
    data: data,
    formSelector: "#registerForm",
    showValidation: true,
    successMessage: "Registration successful! Redirecting...",
    errorMessage: "Registration failed.",
    onSuccess: () => setTimeout(() => window.location.href = "../website/login.html", 3000)
  });
}

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
  countries.forEach(country => {
    $("#country").append(new Option(country, country));
  });
}

function initPaymentMethodToggle() {
  $("#payment_method").on("change", function () {
    const sel = $(this).val();
    $("#paymentDetailsWrapper").toggle(!!sel);
    $("#creditFields, #paypalFields, #bankFields").hide();
    if (sel === "Credit Card")       $("#creditFields").show();
    else if (sel === "PayPal")       $("#paypalFields").show();
    else if (sel === "Bank Transfer") $("#bankFields").show();
  });
}

function initTooltips() {
  $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
}

function getFormData() {
  return {
    salutation:      $("#salutation").val(),
    first_name:      $("#first_name").val(),
    last_name:       $("#last_name").val(),
    address:         $("#address").val(),
    zip:             $("#zip").val(),
    city:            $("#city").val(),
    country:         $("#country").val(),
    email:           $("#email").val(),
    username:        $("#username").val(),
    password:        $("#password").val(),
    password2:       $("#password2").val(),
    payment_method:  $("#payment_method").val(),
    card_number:     $("#card_number").val().trim(),
    csv:             $("#csv").val().trim(),
    paypal_email:    $("#paypal_email").val().trim(),
    paypal_username: $("#paypal_username").val().trim(),
    iban:            $("#iban").val().trim(),
    bic:             $("#bic").val().trim()
  };
}

function validatePaymentFields(data) {
  switch (data.payment_method) {
    case "Credit Card":
      return data.card_number && data.csv;
    case "PayPal":
      return data.paypal_email && data.paypal_username;
    case "Bank Transfer":
      return data.iban && data.bic;
    default:
      return true;
  }
}

function clearValidation(formEl) {
  $(formEl).find('.is-invalid, .is-valid')
    .removeClass('is-invalid is-valid');

  $(formEl).find('.invalid-feedback').hide();

  $(formEl).find('input, select, textarea')
    .each(function () { this.setCustomValidity(''); });
}
