// utils.js

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
  
  // Einheitliches Response-Handling für AJAX-Ergebnisse
  function handleResponse(response, {
    onSuccess = () => {},
    onError = () => {},
    successMessage = null,
    errorMessage = "An error occurred.",
    formSelector = null,
    showValidation = false
  } = {}) {
    if (response.success) {
      if (successMessage) showMessage("success", successMessage);
      if (formSelector) $(formSelector)[0]?.reset();
      onSuccess(response);
    } else {
      const msg = response.error || errorMessage;
      showMessage("danger", msg);
      if (response.errors && showValidation) {
        applyFieldErrors(response.errors);
        if (formSelector) $(formSelector).addClass("was-validated");
      }
      onError(response);
    }
  }
  
  function applyFieldErrors(errors) {
    Object.entries(errors).forEach(([field, message]) => {
      const $field = $(`#${field}`);
      $field.addClass("is-invalid").removeClass("is-valid");
      $field[0].setCustomValidity("Invalid");
      const $feedback = $field.closest(".mb-3").find(".invalid-feedback");
      if ($feedback.length > 0) $feedback.text(message).show();
    });
  }
  
  function setFieldValid(selector) {
    const $field = $(selector);
    $field.removeClass("is-invalid").addClass("is-valid");
    $field[0].setCustomValidity("");
  }
  
  function updateCartCount() {
    $.get("../../backend/api/ApiCart.php?cartCount", function (data) {
      $("#cart-count").text(data.count || 0);
    });
  }
  
  function resetForm(selector) {
    const form = document.querySelector(selector);
    if (!form) return;
    form.reset();
    form.classList.remove("was-validated");
  }
  