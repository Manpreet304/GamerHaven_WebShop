function initAccountInfo() {
  loadAccountInfo();
}

// Account-Info vom Server laden
function loadAccountInfo() {
  $.get("../../backend/api/ApiGuest.php?me")
    .done(function (user) {
      $("#account-info").html(`
        <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Address:</strong> ${user.address}, ${user.zip_code} ${user.city}, ${user.country}</p>
      `);
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load account information." });
    });
}

// Account-Info speichern
function updateAccountInfo() {
  const payload = {
    first_name: $("#first_name").val().trim(),
    last_name: $("#last_name").val().trim(),
    email: $("#email").val().trim(),
    address: $("#address").val().trim(),
    zip_code: $("#zip_code").val().trim(),
    city: $("#city").val().trim(),
    country: $("#country").val().trim(),
    password: $("#password").val().trim()
  };

  $.ajax({
    url: "../../backend/api/ApiAccount.php?update",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function (resp) {
      handleResponse(resp, {
        successMessage: "Account updated successfully.",
        onSuccess: function () {
          bootstrap.Modal.getInstance(document.getElementById("editAccountModal")).hide();
          loadAccountInfo();
        }
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to update account." });
    });
}

// Account bearbeiten Modal öffnen
function openAccountEditForm() {
  $.get("../../backend/api/ApiGuest.php?me")
    .done(function (user) {
      const tpl = document.getElementById("account-edit-template");
      if (!tpl) return;
      const clone = tpl.content.cloneNode(true);

      clone.querySelector("#first_name").value = user.first_name || "";
      clone.querySelector("#last_name").value = user.last_name || "";
      clone.querySelector("#email").value = user.email || "";
      clone.querySelector("#address").value = user.address || "";
      clone.querySelector("#zip_code").value = user.zip_code || "";
      clone.querySelector("#city").value = user.city || "";
      clone.querySelector("#country").value = user.country || "";

      const body = document.getElementById("edit-account-modal-body");
      body.innerHTML = "";
      body.appendChild(clone);

      new bootstrap.Modal(document.getElementById("editAccountModal")).show();
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load account data." });
    });
}
