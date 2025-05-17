(function(window, $) {
  'use strict';

  // Elementreferenzen
  const loginForm        = $('#loginForm');
  const identifierInput  = $('#identifier');
  const passwordInput    = $('#password');
  const rememberCheckbox = $('#rememberMe');
  const formFields       = loginForm.find('.form-control');

  // Init bei DOM ready
  $(function() {
    initTooltips();
    loginForm.on('submit', handleLoginSubmit);
  });

  // Tooltips aktivieren
  function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each((_, el) =>
      new bootstrap.Tooltip(el)
    );
  }

  // Login absenden
  function handleLoginSubmit(event) {
    event.preventDefault();
    const formEl = loginForm[0];
    formEl.classList.add('was-validated');

    // Feedback zurücksetzen
    formFields.removeClass('is-invalid is-valid');
    loginForm.find('.invalid-feedback').hide();

    // Ungültige Felder markieren
    if (!formEl.checkValidity()) {
      $(formEl).find(':invalid').each(function () {
        $(this).addClass('is-invalid');
        $(this).next('.invalid-feedback').show();
      });
      return;
    }

    const payload = {
      identifier: identifierInput.val().trim(),
      password:   passwordInput.val(),
      remember:   rememberCheckbox.is(':checked')
    };

    // Login-Anfrage
    apiRequest({
      url: '../../backend/api/ApiGuest.php?login',
      method: 'POST',
      data: payload,
      formSelector: '#loginForm',
      showValidation: false,
      successMessage: 'Login successful! Redirecting...',
      onSuccess: () => setTimeout(() =>
        window.location.href = '../website/homepage.html', 2000
      ),
      onError: resp => {
        handleResponse(resp, {
          errorMessage: resp.data?.error || resp.message
        });
        displayFieldErrors(resp.data?.errors || {});
      }
    });
  }

  // Fehler an Formularfeldern anzeigen
  function displayFieldErrors(errors) {
    Object.entries(errors).forEach(([field, msg]) => {
      const input = $(`#${field}`);
      const feedback = input.next('.invalid-feedback');
      if (!input.length || !feedback.length) return;

      input.addClass('is-invalid');
      feedback.text(msg).show();
    });
  }

})(window, jQuery);