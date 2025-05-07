/**
 * js/user/login.js
 * Verantwortlich für Benutzer-Login im Frontend
 */
(function(window, $) {
  'use strict';

  // --- Selektoren ---
  const loginForm        = $('#loginForm');
  const identifierInput  = $('#identifier');
  const passwordInput    = $('#password');
  const rememberCheckbox = $('#rememberMe');
  const formFields       = loginForm.find('.form-control');

  // --- Initialisierung bei DOM-Ready ---
  $(function() {
    initTooltips();
    bindEvents();
  });

  // --- Tooltips aktivieren ---
  function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each((_, el) =>
      new bootstrap.Tooltip(el)
    );
  }

  // --- Events binden ---
  function bindEvents() {
    loginForm.on('submit', handleLoginSubmit);
  }

  // --- Event-Handler für Login-Formular ---
  function handleLoginSubmit(event) {
    event.preventDefault();
    const formEl = loginForm[0];

    // Bootstrap-Validation-Klasse setzen
    formEl.classList.add('was-validated');
    if (!formEl.checkValidity()) return;

    const payload = {
      identifier: identifierInput.val().trim(),
      password:   passwordInput.val(),
      remember:   rememberCheckbox.is(':checked')
    };

    apiRequest({
      url: '../../backend/api/ApiGuest.php?login',
      method: 'POST',
      data: payload,
      formSelector: '#loginForm',
      showValidation: false,
      successMessage: 'Login successful! Redirecting...',
      onSuccess: () => setTimeout(
        () => window.location.href = '../website/homepage.html',
        2000
      ),
      onError: resp => {
        // Backend-Meldung anzeigen (richtig priorisiert!)
        handleResponse(resp, {
          errorMessage: resp.data?.error || resp.message
        });

        // Feldspezifische Fehler markieren
        const errors = resp.data?.errors || {};
        displayFieldErrors(errors);
      }
    });
  }

  // --- Feld-Fehlermarkierung ---
  function displayFieldErrors(errors) {
    formFields.removeClass('is-invalid is-valid');

    Object.entries(errors).forEach(([field, msg]) => {
      const input = $(`#${field}`);
      const feedback = input.next('.invalid-feedback');
      if (!input.length || !feedback.length) return;

      input.addClass('is-invalid');
      feedback.text(msg).show();
    });
  }

})(window, jQuery);
