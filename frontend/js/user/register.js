(function(window, $) {
  'use strict';

  // [1] Formularelemente zwischenspeichern
  const registerForm        = $('#registerForm');
  const salutationInput     = $('#salutation');
  const firstNameInput      = $('#first_name');
  const lastNameInput       = $('#last_name');
  const addressInput        = $('#address');
  const zipInput            = $('#zip');
  const cityInput           = $('#city');
  const countrySelect       = $('#country');
  const emailInput          = $('#email');
  const usernameInput       = $('#username');
  const passwordInput       = $('#password');
  const password2Input      = $('#password2');
  const paymentMethodSelect = $('#payment_method');

  // [2] Initialisierung bei DOM-Ready
  $(function() {
    initCountryDropdown();
    initTooltips();
    bindEvents();
  });

  // [3] Tooltips aktivieren
  function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each((_, el) =>
      new bootstrap.Tooltip(el)
    );
  }

  // [4] Events an Formularelemente binden
  function bindEvents() {
    paymentMethodSelect.on('change', handlePaymentMethodToggle);
    registerForm.on('submit', handleFormSubmit);
  }

  // [5] Formular absenden und validieren
  function handleFormSubmit(e) {
    e.preventDefault();
    const formEl = registerForm[0];
    formEl.classList.add('was-validated');

    // [5.1] Feedback zurücksetzen
    registerForm.find('.is-valid, .is-invalid').removeClass('is-valid is-invalid');
    registerForm.find('.invalid-feedback').hide();

    // [5.2] Fehlerhafte Felder markieren
    $(formEl).find(':invalid').each(function () {
      $(this).addClass('is-invalid');
      $(this).next('.invalid-feedback').show();
    });

    if (!formEl.checkValidity()) return;

    // [5.3] Formulardaten erfassen
    const data = getFormData();

    // [5.4] Zahlungsdaten validieren
    if (!validatePaymentFields(data)) {
      showMessage("danger", "Please complete all required payment fields.");
      return;
    }

    // [5.5] Registrierung abschicken
    apiRequest({
      url: '../../backend/api/ApiGuest.php?register',
      method: 'POST',
      data,
      formSelector: '#registerForm',
      showValidation: false,
      successMessage: 'Registration successful! Redirecting...',
      onSuccess: () => setTimeout(() => window.location.href = '../website/login.html', 3000),
      onError: resp => {
        handleResponse(resp, {
          errorMessage: resp.data?.error || resp.message
        });
        applyFieldErrors(resp.data?.errors || {});
      }
    });
  }

  // [6] Feldfehler visuell anzeigen
  function applyFieldErrors(errors) {
    Object.entries(errors).forEach(([field, msg]) => {
      const $input = $(`#${field}`);
      const $feedback = $input.next('.invalid-feedback');
      if ($input.length && $feedback.length) {
        $input.addClass('is-invalid');
        $feedback.text(msg).show();
      }
    });
  }

  // [7] Formulardaten sammeln
  function getFormData() {
    return {
      salutation:      salutationInput.val(),
      first_name:      firstNameInput.val(),
      last_name:       lastNameInput.val(),
      address:         addressInput.val(),
      zip:             zipInput.val(),
      city:            cityInput.val(),
      country:         countrySelect.val(),
      email:           emailInput.val(),
      username:        usernameInput.val(),
      password:        passwordInput.val(),
      password2:       password2Input.val(),
      payment_method:  paymentMethodSelect.val(),
      card_number:     $('#card_number').val().trim(),
      csv:             $('#csv').val().trim(),
      paypal_email:    $('#paypal_email').val().trim(),
      paypal_username: $('#paypal_username').val().trim(),
      iban:            $('#iban').val().trim(),
      bic:             $('#bic').val().trim()
    };
  }

  // [8] Zahlungsmethoden prüfen
  function validatePaymentFields(data) {
    switch (data.payment_method) {
      case 'Credit Card':   return data.card_number && data.csv;
      case 'PayPal':        return data.paypal_email && data.paypal_username;
      case 'Bank Transfer': return data.iban && data.bic;
      default:              return true;
    }
  }

  // [9] Zahlungsfelder anzeigen/verstecken je nach Auswahl
  function handlePaymentMethodToggle() {
    const method = paymentMethodSelect.val();
    $('#paymentDetailsWrapper').toggle(!!method);
    $('#creditFields, #paypalFields, #bankFields').hide();

    if (method === 'Credit Card')        $('#creditFields').show();
    else if (method === 'PayPal')        $('#paypalFields').show();
    else if (method === 'Bank Transfer') $('#bankFields').show();
  }

  // [10] Länder-Dropdown dynamisch befüllen
  function initCountryDropdown() {
    const countries = [
      'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina','Armenia',
      'Australia','Austria','Azerbaijan','Belgium','Brazil','Bulgaria','Canada',
      'Chile','China','Colombia','Croatia','Czech Republic','Denmark','Egypt',
      'Estonia','Finland','France','Germany','Greece','Hungary','India','Indonesia',
      'Ireland','Israel','Italy','Japan','Kazakhstan','Latvia','Lithuania',
      'Luxembourg','Mexico','Netherlands','New Zealand','Norway','Pakistan','Peru',
      'Philippines','Poland','Portugal','Romania','Russia','Saudi Arabia','Serbia',
      'Singapore','Slovakia','Slovenia','South Africa','South Korea','Spain','Sweden',
      'Switzerland','Thailand','Turkey','Ukraine','United Arab Emirates','United Kingdom',
      'United States','Vietnam','Zimbabwe'
    ];
    countries.forEach(country =>
      countrySelect.append(new Option(country, country))
    );
  }

})(window, jQuery);