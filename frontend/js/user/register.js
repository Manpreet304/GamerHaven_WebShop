/**
 * js/user/register.js
 * Verantwortlich für Benutzer-Registrierung im Frontend
 */
(function(window, $) {
  'use strict';

  // --- Selektoren ---
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

  // --- Initialisierung bei DOM-Ready ---
  $(function() {
    initCountryDropdown();
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
    paymentMethodSelect.on('change', handlePaymentMethodToggle);
    registerForm.on('submit', handleFormSubmit);
  }

  // --- Formular absenden ---
  function handleFormSubmit(e) {
    e.preventDefault();
    const form = registerForm[0];
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    const data = getFormData();
    if (!validatePaymentFields(data)) return;
    registerUser(data);
  }

  // --- Registrierung durchführen ---
  function registerUser(data) {
    apiRequest({
      url: '../../backend/api/ApiGuest.php?register',
      method: 'POST',
      data,
      formSelector: '#registerForm',
      showValidation: false,
      successMessage: 'Registration successful! Redirecting...',
      onSuccess: () => setTimeout(
        () => window.location.href = '../website/login.html',
        3000
      ),
      onError: resp => {
        handleResponse(resp, {
          errorMessage: resp.data?.error || resp.message
        });
        showFieldErrors(resp.data?.errors || {});
      }
    });
  }

  // --- Feld-spezifische Fehler anzeigen ---
  function showFieldErrors(errors) {
    registerForm.find('.is-invalid, .is-valid')
      .removeClass('is-invalid is-valid');

    Object.entries(errors).forEach(([field, msg]) => {
      const $input = $(`#${field}`);
      const $fb    = $input.next('.invalid-feedback');
      if (!$input.length || !$fb.length) return;
      $input.addClass('is-invalid');
      $fb.text(msg).show();
    });
  }

  // --- Länder-Dropdown befüllen ---
  function initCountryDropdown() {
    const countries = [
      'Afghanistan','Albania','Algeria','Andorra','Angola','Argentina',
      'Armenia','Australia','Austria','Azerbaijan','Belgium','Brazil',
      'Bulgaria','Canada','Chile','China','Colombia','Croatia','Czech Republic',
      'Denmark','Egypt','Estonia','Finland','France','Germany','Greece','Hungary',
      'India','Indonesia','Ireland','Israel','Italy','Japan','Kazakhstan','Latvia',
      'Lithuania','Luxembourg','Mexico','Netherlands','New Zealand','Norway','Pakistan',
      'Peru','Philippines','Poland','Portugal','Romania','Russia','Saudi Arabia','Serbia',
      'Singapore','Slovakia','Slovenia','South Africa','South Korea','Spain','Sweden',
      'Switzerland','Thailand','Turkey','Ukraine','United Arab Emirates','United Kingdom',
      'United States','Vietnam','Zimbabwe'
    ];
    countries.forEach(country =>
      countrySelect.append(new Option(country, country))
    );
  }

  // --- Zahlungsfelder umschalten ---
  function handlePaymentMethodToggle() {
    const method = paymentMethodSelect.val();
    $('#paymentDetailsWrapper').toggle(!!method);
    $('#creditFields, #paypalFields, #bankFields').hide();
    if (method === 'Credit Card')        $('#creditFields').show();
    else if (method === 'PayPal')         $('#paypalFields').show();
    else if (method === 'Bank Transfer')  $('#bankFields').show();
  }

  // --- Formulardaten sammeln ---
  function getFormData() {
    return {
      salutation:     salutationInput.val(),
      first_name:     firstNameInput.val(),
      last_name:      lastNameInput.val(),
      address:        addressInput.val(),
      zip:            zipInput.val(),
      city:           cityInput.val(),
      country:        countrySelect.val(),
      email:          emailInput.val(),
      username:       usernameInput.val(),
      password:       passwordInput.val(),
      password2:      password2Input.val(),
      payment_method: paymentMethodSelect.val(),
      card_number:    $('#card_number').val().trim(),
      csv:            $('#csv').val().trim(),
      paypal_email:   $('#paypal_email').val().trim(),
      paypal_username:$('#paypal_username').val().trim(),
      iban:           $('#iban').val().trim(),
      bic:            $('#bic').val().trim()
    };
  }

  // --- Zahlungsdaten validieren ---
  function validatePaymentFields(data) {
    switch (data.payment_method) {
      case 'Credit Card':   return !!(data.card_number && data.csv);
      case 'PayPal':        return !!(data.paypal_email && data.paypal_username);
      case 'Bank Transfer': return !!(data.iban && data.bic);
      default:               return true;
    }
  }

})(window, jQuery);
