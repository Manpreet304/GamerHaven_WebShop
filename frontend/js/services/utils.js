// /services/utils.js

// Zeigt eine Erfolg- oder Fehlermeldung an
function showMessage(type, text, target = "#messageBox") {
  const alertClass = (type === "success") ? "alert-success" : "alert-danger";

  const html = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  const container = $(target);
  container.find(".alert").alert("close"); // Alte Meldungen schließen
  container.empty().append(html);

  setTimeout(function() {
    container.find(".alert").alert("close");
  }, 5000);
}

// Verarbeitet Antworten vom Server
function handleResponse(response, options = {}) {
  var onSuccess = options.onSuccess || function() {};
  var onError = options.onError || function() {};
  var successMessage = options.successMessage || null;
  var errorMessage = options.errorMessage || "Error occured!";
  var formSelector = options.formSelector || null;
  var showValidation = options.showValidation || false;

  if (response.success) {
    if (successMessage) {
      showMessage("success", successMessage);
    }
    if (formSelector) {
      resetForm(formSelector);
    }
    onSuccess(response);
  } else {
    var msg = response.message || errorMessage;
    showMessage("danger", msg);

    if (response.errors && showValidation) {
      applyFieldErrors(response.errors);
      if (formSelector) {
        $(formSelector).addClass("was-validated");
      }
    }
    onError(response);
  }
}

// Zeigt Validierungsfehler direkt bei Eingabefeldern an
function applyFieldErrors(errors) {
  for (var field in errors) {
    if (errors.hasOwnProperty(field)) {
      var message = errors[field];
      var $field = $("#" + field);

      if ($field.length) {
        $field.addClass("is-invalid").removeClass("is-valid");
        $field[0].setCustomValidity("Invalid");
        var $feedback = $field.closest(".mb-3").find(".invalid-feedback");
        if ($feedback.length) {
          $feedback.text(message).show();
        }
      }
    }
  }
}

// Holt die aktuelle Warenkorb-Anzahl und zeigt sie in der Navbar an
function updateCartCount() {
  $.get("../../backend/api/ApiCart.php?cartCount")
    .done(function(data) {
      $("#cart-count").text(data.count || 0);
    })
    .fail(function() {
      $("#cart-count").text(0);
    });
}

// Setzt ein Formular komplett zurück - Admin
function resetForm(selector) {
  var form = document.querySelector(selector);
  if (form) {
    form.reset();
    form.classList.remove("was-validated");
  }
}
