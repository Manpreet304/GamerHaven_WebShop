// ----------------------- API CALLS -----------------------

/**
 * Send registration data to backend and handle response.
 * @param {Object} data
 */
function registerUser(data) {
    $.ajax({
      url: "../../backend/api/ApiGuest.php?register",
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: response => {
        if (response.success) {
          showMessage("success", "Registration successful! Redirecting...");
          setTimeout(() => window.location.href = "../website/login.html", 3000);
        }
      },
      error: xhr => {
        const errors = xhr.responseJSON?.errors || { general: "Registration failed." };
        if (errors.general) showMessage("danger", errors.general);
        applyFieldErrors(errors);
        $("#registerForm").addClass("was-validated");
      }
    });
  }
  
  
  // ----------------------- INITIALIZATION -----------------------
  
  $(document).ready(function () {
    initCountryDropdown();
    initPaymentMethodToggle();
    initTooltips();
  
    // Handle registration form submission
    $("#registerForm").on("submit", function (e) {
      e.preventDefault();
      clearFormValidation();
  
      const data = getFormData();
      if (!validatePaymentFields(data)) return;
  
      const formEl = document.getElementById("registerForm");
      if (!formEl.checkValidity()) {
        formEl.classList.add("was-validated");
        return;
      }
  
      registerUser(data);
    });
  });
  
  
  // ----------------------- UI SETUP FUNCTIONS -----------------------
  
  /** Populate the country <select> with all country names. */
  function initCountryDropdown() {
    const countries = [
      "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
      /* … rest of the list … */
      "United States", "Vietnam", "Zimbabwe"
    ];
    countries.forEach(country => {
      $("#country").append(new Option(country, country));
    });
  }
  
  /** Show/hide the payment detail fields based on selected method. */
  function initPaymentMethodToggle() {
    $("#payment_method").on("change", function () {
      const sel = $(this).val();
      $("#paymentDetailsWrapper").toggle(!!sel);
      $("#creditFields, #paypalFields, #bankFields").hide();
      if (sel === "Credit Card")      $("#creditFields").show();
      else if (sel === "PayPal")       $("#paypalFields").show();
      else if (sel === "Bank Transfer")$("#bankFields").show();
    });
  }
  
  /** Initialize all Bootstrap tooltips on the page. */
  function initTooltips() {
    const tpl = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    [].slice.call(tpl).forEach(el => new bootstrap.Tooltip(el));
  }
  
  /** Clear any previous validation styling/messages on the form. */
  function clearFormValidation() {
    $("#registerForm input, #registerForm select")
      .each(function () {
        $(this).removeClass("is-valid is-invalid")[0].setCustomValidity("");
      });
  }
  
  
  // ----------------------- HELPER FUNCTIONS -----------------------
  
  /** Collect all form field values into a single data object. */
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
  
  /**
   * Frontend validation for payment‐specific fields.
   * Returns false (and marks fields) if any required data is missing.
   */
  function validatePaymentFields(data) {
    switch (data.payment_method) {
      case "Credit Card":
        if (!data.card_number || !data.csv) {
          if (!data.card_number) setFieldError("#card_number", "Card number is required.");
          if (!data.csv)         setFieldError("#csv",         "CSV is required.");
          return false;
        }
        break;
  
      case "PayPal":
        if (!data.paypal_email || !data.paypal_username) {
          if (!data.paypal_email)    setFieldError("#paypal_email",    "PayPal email is required.");
          if (!data.paypal_username) setFieldError("#paypal_username", "PayPal username is required.");
          return false;
        }
        break;
  
      case "Bank Transfer":
        if (!data.iban || !data.bic) {
          if (!data.iban) setFieldError("#iban", "IBAN is required.");
          if (!data.bic)  setFieldError("#bic",  "BIC is required.");
          return false;
        }
        break;
    }
    return true;
  }
  