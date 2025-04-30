
function showMessage(type, text, target) {
  if (!target) {
    target = "#messageBox";
  }
  var alertClass = (type === "success") ? "alert-success" : "alert-danger";
  var html = ''
    + '<div class="alert ' + alertClass + ' alert-dismissible fade show" role="alert">'
    +   text
    +   '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
    + '</div>';
  var container = $(target);
  container.find(".alert").alert("close");
  container.empty().append(html);

  setTimeout(function() {
    container.find(".alert").alert("close");
  }, 5000);
}

function handleResponse(response, options) {
  if (!options) {
    options = {};
  }
  var onSuccess      = options.onSuccess      || function() {};
  var onError        = options.onError        || function() {};
  var successMessage = options.successMessage || null;
  var errorMessage   = options.errorMessage   || "An error occurred!";
  var formSelector   = options.formSelector   || null;
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
    // Fehlerpfad: zuerst response.error, dann response.message, dann default
    var msg = response.error || response.message || errorMessage;
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


function setFieldValid(selector) {
  var $field = $(selector);
  if ($field.length) {
    $field.removeClass("is-invalid").addClass("is-valid");
    $field[0].setCustomValidity("");
  }
}

function updateCartCount() {
  $.get("../../backend/api/ApiCart.php?cartCount")
    .done(function(data) {
      $("#cart-count").text(data.count || 0);
    })
    .fail(function() {
      $("#cart-count").text(0);
    });
}


function resetForm(selector) {
  var form = document.querySelector(selector);
  if (form) {
    form.reset();
    form.classList.remove("was-validated");
  }
}
