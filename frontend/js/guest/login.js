// /user/login.js

$(document).ready(function () {
  
  // Wenn das Login-Formular abgesendet wird
  $("#loginForm").on("submit", function (e) {
    e.preventDefault(); // Verhindert normales Formular-Absenden

    const form = this;
    form.classList.remove("was-validated"); // Entfernt alte Validierung

    // Setzt alle Eingabefelder zurück
    $("#loginForm input").each(function () {
      $(this).removeClass("is-valid is-invalid")[0].setCustomValidity("");
    });

    // Holt die Daten aus den Feldern
    const data = {
      identifier: $("#identifier").val(),
      password: $("#password").val(),
      remember: $("#rememberMe").is(":checked")
    };

    // Prüft, ob das Formular gültig ist
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    // Schickt die Login-Daten an den Server
    $.ajax({
      url: "../../backend/api/ApiGuest.php?login",
      method: "POST",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(data),
      success: function (response) {
        handleResponse(response, {
          successMessage: "Login successful! Redirecting...",
          onSuccess: function () {
            setTimeout(function () {
              window.location.href = "../website/homepage.html"; // Weiterleitung nach Login
            }, 2000);
          }
        });
      },
      error: function (xhr) {
        handleResponse(xhr.responseJSON || {}, {
          errorMessage: "Login failed. Please check your credentials.",
          formSelector: "#loginForm",
          showValidation: true
        });
      }
    });
  });

  // Initialisiert Bootstrap-Tooltips
  $('[data-bs-toggle="tooltip"]').each(function (_, el) {
    new bootstrap.Tooltip(el);
  });

});
