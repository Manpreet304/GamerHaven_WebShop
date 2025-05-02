// js/user/login.js
(function(window, $) {
  $(function() {
    // Tooltips initialisieren
    $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));

    $("#loginForm").on("submit", function(e) {
      e.preventDefault();
      const formEl = this;

      // Bootstrap-Validation-Klasse setzen
      formEl.classList.add("was-validated");
      if (!formEl.checkValidity()) return;

      const data = {
        identifier: $("#identifier").val().trim(),
        password:   $("#password").val(),
        remember:   $("#rememberMe").is(":checked")
      };

      apiRequest({
        url: "../../backend/api/ApiGuest.php?login",
        method: "POST",
        data,
        formSelector: "#loginForm",
        showValidation: false,       // wir übernehmen das Feld-Highlighting selbst
        successMessage: "Login successful! Redirecting...",
        // kein statischer errorMessage
        onSuccess: () => setTimeout(() => {
          window.location.href = "../website/homepage.html";
        }, 2000),
        onError: resp => {
          // Zeige exakt das Backend-message
          handleResponse(resp, { errorMessage: resp.message });
          // Feld-spezifische Fehler markieren
          const fieldErrors = resp.data?.errors || {};
          showFieldErrors(fieldErrors);
        }
      });
    });
  });

  function showFieldErrors(errors) {
    // Alte Validierungs-Klassen entfernen
    $("#loginForm .is-invalid, #loginForm .is-valid")
      .removeClass("is-invalid is-valid");

    Object.entries(errors).forEach(([field, msg]) => {
      const $input = $(`#${field}`);
      const $fb    = $input.next(".invalid-feedback");
      if (!$input.length || !$fb.length) return;

      $input.addClass("is-invalid");
      $fb.text(msg).show();
    });
  }
})(window, jQuery);
