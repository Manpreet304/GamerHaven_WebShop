// /admin/customers.js

$(document).ready(function () {
  loadCustomers();
  bindCustomerEvents();
});

/** ------------------- KUNDEN LADEN ------------------- **/

function loadCustomers() {
  $.getJSON("../../backend/api/ApiAdmin.php?listCustomers")
    .done(function (users) {
      const tbody = $("#customersTable tbody").empty();

      users.forEach(function (user) {
        const active = user.is_active === "true";

        tbody.append(`
          <tr data-id="${user.id}">
            <td>${user.id}</td>
            <td>${user.firstname} ${user.lastname}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td class="cell-active">${active ? "✔️" : "❌"}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-customer" data-id="${user.id}">Edit</button>
              <button class="btn btn-sm btn-danger delete-customer" data-id="${user.id}">Delete</button>
            </td>
          </tr>
        `);
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load customers." });
    });
}

/** ------------------- KUNDEN-MODAL ÖFFNEN ------------------- **/

function openCustomerModal(id) {
  resetForm("#customerForm");
  $("#customer_password").val("");

  if (id) {
    $.getJSON(`../../backend/api/ApiAdmin.php?getCustomer&id=${id}`)
      .done(function (user) {
        $("#customer_id").val(user.id);
        $("#customer_firstname").val(user.firstname);
        $("#customer_lastname").val(user.lastname);
        $("#customer_email").val(user.email);
        $("#customer_username").val(user.username);
        $("#customer_salutation").val(user.salutation);
        $("#customer_role").val(user.role);
        $("#customer_active").val(user.is_active === "true" ? "1" : "0");
        $("#customer_address").val(user.address === "0" ? "" : user.address);
        $("#customer_zip_code").val(user.zip_code === "0" ? "" : user.zip_code);
        $("#customer_city").val(user.city === "0" ? "" : user.city);
        $("#customer_country").val(user.country === "0" ? "" : user.country);
      })
      .fail(function (xhr) {
        handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load customer data." });
      });
  }

  new bootstrap.Modal(document.getElementById("customerModal")).show();
}

/** ------------------- KUNDEN SPEICHERN ------------------- **/

function saveCustomer() {
  const form = document.getElementById("customerForm");
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const payload = {
    id: +$("#customer_id").val(),
    firstname: $("#customer_firstname").val(),
    lastname: $("#customer_lastname").val(),
    email: $("#customer_email").val(),
    username: $("#customer_username").val(),
    salutation: $("#customer_salutation").val(),
    role: $("#customer_role").val(),
    is_active: +$("#customer_active").val(),
    address: $("#customer_address").val() || null,
    zip_code: $("#customer_zip_code").val() || null,
    city: $("#customer_city").val() || null,
    country: $("#customer_country").val() || null
  };

  const password = $("#customer_password").val().trim();
  if (password) {
    payload.password = password;
  }

  $.ajax({
    url: `../../backend/api/ApiAdmin.php?updateCustomer&id=${payload.id}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  })
    .done(function (response) {
      handleResponse(response, {
        successMessage: "Customer updated successfully.",
        onSuccess: function () {
          loadCustomers();
          bootstrap.Modal.getInstance(document.getElementById("customerModal")).hide();
        }
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to save customer settings." });
    });
}

/** ------------------- KUNDEN LÖSCHEN ------------------- **/

function deleteCustomer(id) {
  if (!confirm("Are you sure you want to delete this customer?")) return;

  $.post(`../../backend/api/ApiAdmin.php?deleteCustomer&id=${id}`)
    .done(function (response) {
      handleResponse(response, {
        successMessage: "Customer deleted successfully.",
        onSuccess: loadCustomers
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to delete customer." });
    });
}

/** ------------------- EVENTS BINDEN ------------------- **/

function bindCustomerEvents() {
  $(document).on("click", ".edit-customer", function (e) {
    openCustomerModal($(e.currentTarget).data("id"));
  });

  $(document).on("click", ".delete-customer", function (e) {
    deleteCustomer($(e.currentTarget).data("id"));
  });

  $("#saveCustomerBtn").click(saveCustomer);
}
