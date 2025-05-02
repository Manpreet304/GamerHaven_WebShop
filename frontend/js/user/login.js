$(document).ready(function () {
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const formEl = this;
    formEl.classList.remove("was-validated");
    clearValidation(formEl);

    const data = {
      identifier: $("#identifier").val(),
      password: $("#password").val(),
      remember: $("#rememberMe").is(":checked")
    };

    if (!formEl.checkValidity()) {
      formEl.classList.add("was-validated");
      return;
    }

    apiRequest({
      url: "../../backend/api/ApiGuest.php?login",
      method: "POST",
      data: data,
      formSelector: "#loginForm",
      showValidation: true,
      successMessage: "Login successful! Redirecting...",
      errorMessage: "Login failed.",
      onSuccess: () => setTimeout(() => {
        window.location.href = "../website/homepage.html";
      }, 2000)
    });
  });

  $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
});

function clearValidation(formEl) {
  $(formEl).find('.is-invalid, .is-valid')
    .removeClass('is-invalid is-valid');

  $(formEl).find('.invalid-feedback').hide();

  $(formEl).find('input, select, textarea')
    .each(function () { this.setCustomValidity(''); });
}
