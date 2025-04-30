$(document).ready(function () {
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const formEl = this;
    // Alte Validierungs-Zustände komplett entfernen
    formEl.classList.remove("was-validated");
    clearValidation(formEl);

    const data = {
      identifier: $("#identifier").val(),
      password:   $("#password").val(),
      remember:   $("#rememberMe").is(":checked")
    };

    // Browser-HTML5-Validation
    if (!formEl.checkValidity()) {
      formEl.classList.add("was-validated");
      return;
    }

    // AJAX-Login-Request
    $.ajax({
      url: "../../backend/api/ApiGuest.php?login",
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: res => handleResponse(res, {
        successMessage: "Login successful! Redirecting...",
        formSelector: "#loginForm",
        showValidation: true,
        onSuccess: () => setTimeout(() => {
          window.location.href = "../website/homepage.html";
        }, 2000)
      }),
      error: xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Login failed.",
        formSelector: "#loginForm",
        showValidation: true
      })
    });
  });

  // Tooltips initialisieren
  $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
});

/**
 * Cleans up all validation markers and customValidity flags
 * so the form can be re-validated on every submit.
 */
function clearValidation(formEl) {
  // Remove Bootstrap valid/invalid classes
  $(formEl).find('.is-invalid, .is-valid')
    .removeClass('is-invalid is-valid');

  // Hide any invalid-feedback elements
  $(formEl).find('.invalid-feedback').hide();

  // Reset any CustomValidity flags
  $(formEl).find('input, select, textarea')
    .each(function() { this.setCustomValidity(''); });
}
