(function(window, $) {
  'use strict';

  // [1] Elementreferenzen
  const loginForm        = $('#loginForm');
  const identifierInput  = $('#identifier');
  const passwordInput    = $('#password');
  const rememberCheckbox = $('#rememberMe');
  const formFields       = loginForm.find('.form-control');

  // [2] Initialisierung bei DOM ready
  $(function() {
    initTooltips();
    loginForm.on('submit', handleLoginSubmit);
  });

  // [3] Bootstrap Tooltips aktivieren
  function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each((_, el) =>
      new bootstrap.Tooltip(el)
    );
  }

  // [4] Login absenden & validieren
  function handleLoginSubmit(event) {
    event.preventDefault();
    const formEl = loginForm[0];
    formEl.classList.add('was-validated');

    // [4.1] Feedback zurücksetzen
    formFields.removeClass('is-invalid is-valid');
    loginForm.find('.invalid-feedback').hide();

    // [4.2] Ungültige Felder markieren
    if (!formEl.checkValidity()) {
      $(formEl).find(':invalid').each(function () {
        $(this).addClass('is-invalid');
        $(this).next('.invalid-feedback').show();
      });
      return;
    }

    // [4.3] Daten vorbereiten
    const payload = {
      identifier: identifierInput.val().trim(),
      password:   passwordInput.val(),
      remember:   rememberCheckbox.is(':checked')
    };

    // [4.4] API-Aufruf zur Anmeldung
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

  // [5] Fehler gezielt an betroffenen Feldern anzeigen
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
