// ----------------------- MESSAGES -----------------------

function showMessage(type, text, target) {
  target = target || "#messageBox";
  var alertClass = (type === "success") ? "alert-success" : "alert-danger";
  var html = ''
    + '<div class="alert ' + alertClass + ' alert-dismissible fade show" role="alert">'
    + text
    + '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>'
    + '</div>';
  var container = $(target);
  container.find(".alert").alert("close");
  container.empty().append(html);
  setTimeout(() => container.find(".alert").alert("close"), 5000);
}

// ----------------------- API WRAPPER -----------------------

function apiRequest(options) {
  const {
    url,
    method = "GET",
    data = null,
    headers = {},
    contentType = "application/json",
    successMessage = null,
    errorMessage = "An error occurred!",
    onSuccess = () => {},
    onError = () => {},
    formSelector = null,
    showValidation = false
  } = options;

  $.ajax({
    url,
    method,
    data: data ? JSON.stringify(data) : null,
    contentType,
    dataType: "json",
    headers,
    xhrFields: {
      withCredentials: true // ← wichtig für Cookies (Session)
    }
  })
    .done(response => {
      if (response.success) {
        const wrapped = {
          ...response,
          body: response.data ?? null
        };
        if (successMessage) showMessage("success", successMessage);
        if (formSelector) resetForm(formSelector);
        onSuccess(wrapped);
      } else {
        handleResponse(response, { errorMessage, formSelector, showValidation, onError });
      }
    })
    .fail(xhr => {
      const msg = xhr.responseJSON?.message || errorMessage;
      showMessage("danger", msg);
      onError(xhr.responseJSON || {});
    });
}

// ----------------------- RESPONSE HANDLER -----------------------

function handleResponse(response, options = {}) {
  const {
    successMessage = null,
    errorMessage = "An error occurred!",
    formSelector = null,
    showValidation = false,
    onSuccess = () => {},
    onError = () => {}
  } = options;

  if (response.success) {
    if (successMessage) showMessage("success", successMessage);
    if (formSelector) resetForm(formSelector);
    onSuccess(response);
  } else {
    const msg = response.error || response.message || errorMessage;
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

// ----------------------- VALIDATION -----------------------

function applyFieldErrors(errors) {
  for (let field in errors) {
    if (errors.hasOwnProperty(field)) {
      const message = errors[field];
      const $field = $("#" + field);
      if ($field.length) {
        $field.addClass("is-invalid").removeClass("is-valid");
        $field[0].setCustomValidity("Invalid");
        const $feedback = $field.closest(".mb-3").find(".invalid-feedback");
        if ($feedback.length) {
          $feedback.text(message).show();
        }
      }
    }
  }
}

function setFieldValid(selector) {
  const $field = $(selector);
  if ($field.length) {
    $field.removeClass("is-invalid").addClass("is-valid");
    $field[0].setCustomValidity("");
  }
}

function resetForm(selector) {
  const form = document.querySelector(selector);
  if (form) {
    form.reset();
    form.classList.remove("was-validated");
    $(form).find(".is-valid, .is-invalid").removeClass("is-valid is-invalid");
    $(form).find(".invalid-feedback").hide();
  }
}

// ----------------------- CART COUNT -----------------------

function updateCartCount() {
  $.ajax({
    url: "../../backend/api/ApiCart.php?cartCount",
    method: "GET",
    dataType: "json",
    xhrFields: { withCredentials: true }
  })
    .done(res => {
      let count = 0;

      if (res.success && res.data && res.data.body) {
        count = parseInt(res.data.body.count, 10) || 0;
      }

      $("#cart-count").text(count);
    })
    .fail(() => {
      $("#cart-count").text(0);
    });
}

// ----------------------- GLOBAL EXPORT -----------------------

window.showMessage = showMessage;
window.apiRequest = apiRequest;
window.handleResponse = handleResponse;
window.applyFieldErrors = applyFieldErrors;
window.setFieldValid = setFieldValid;
window.resetForm = resetForm;
window.updateCartCount = updateCartCount;
