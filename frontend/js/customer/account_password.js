function initAccountPassword() {
  injectPasswordForm();
}

// Passwort Formular injizieren
function injectPasswordForm() {
  const tpl = document.getElementById("password-change-template");
  if (tpl) {
    const clone = tpl.content.cloneNode(true);
    document.getElementById("password-change-section").appendChild(clone);
  }
}

// Passwort ändern
function changePassword() {
  const data = {
    old_password: $("#old_password").val().trim(),
    new_password: $("#new_password").val().trim()
  };

  $.ajax({
    url: "../../backend/api/ApiAccount.php?password",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data)
  })
    .done(function (resp) {
      handleResponse(resp, {
        successMessage: "Password updated successfully.",
        onSuccess: function () {
          $("#change-password-form")[0].reset();
        }
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to update password." });
    });
}
