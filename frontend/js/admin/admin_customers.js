// js/admin/admin_customers.js
(function(window, $) {
  // Einmalig: Tabelle und Modal hooken
  const $tableBody     = $("#customersTable tbody");
  const customerModal  = new bootstrap.Modal($("#customerModal"));

  function loadCustomers() {
    apiRequest({
      url: "../../backend/api/ApiAdmin.php?listCustomers",
      method: "GET",
      onSuccess: res => {
        const users = res.data; // Array von Kunden
        $tableBody.empty();
        users.forEach(u => {
          const active = u.is_active === "true" || u.is_active === true;
          $tableBody.append(`
            <tr data-id="${u.id}">
              <td>${u.id}</td>
              <td>${u.firstname} ${u.lastname}</td>
              <td>${u.username}</td>
              <td>${u.email}</td>
              <td class="cell-active">${active ? "✔️" : "❌"}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-customer">Edit</button>
                <button class="btn btn-sm btn-danger delete-customer">Delete</button>
              </td>
            </tr>
          `);
        });
      },
      onError: err => handleResponse(err, {})  // Backend-message wird angezeigt
    });
  }

  function openCustomerModal(id) {
    resetForm("#customerForm");
    $("#customer_password").val("");

    if (id) {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?getCustomer&id=${id}`,
        method: "GET",
        onSuccess: res => {
          const u = res.data;
          $("#customer_id").val(u.id);
          $("#customer_firstname").val(u.firstname);
          $("#customer_lastname").val(u.lastname);
          $("#customer_email").val(u.email);
          $("#customer_username").val(u.username);
          $("#customer_salutation").val(u.salutation);
          $("#customer_role").val(u.role);
          $("#customer_active").val(u.is_active === "true" ? "1" : "0");
          $("#customer_address").val(u.address || "");
          $("#customer_zip_code").val(u.zip_code || "");
          $("#customer_city").val(u.city || "");
          $("#customer_country").val(u.country || "");
          customerModal.show();
        },
        onError: err => handleResponse(err, {})
      });
    } else {
      customerModal.show();
    }
  }

  function saveCustomer() {
    const form = $("#customerForm")[0];
    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      return;
    }

    const payload = {
      id:          +$("#customer_id").val(),
      firstname:   $("#customer_firstname").val(),
      lastname:    $("#customer_lastname").val(),
      email:       $("#customer_email").val(),
      username:    $("#customer_username").val(),
      salutation:  $("#customer_salutation").val(),
      role:        $("#customer_role").val(),
      is_active:   +$("#customer_active").val(),
      address:     $("#customer_address").val() || null,
      zip_code:    $("#customer_zip_code").val() || null,
      city:        $("#customer_city").val() || null,
      country:     $("#customer_country").val() || null
    };
    const pw = $("#customer_password").val().trim();
    if (pw) payload.password = pw;

    apiRequest({
      url: `../../backend/api/ApiAdmin.php?updateCustomer&id=${payload.id}`,
      method: "POST",
      data: payload,
      successMessage: "Customer settings saved successfully.",
      onSuccess: () => {
        loadCustomers();
        customerModal.hide();
      },
      onError: err => handleResponse(err, {})
    });
  }

  function deleteCustomer(id) {
    if (!confirm("Are you sure you want to delete this customer?")) return;

    apiRequest({
      url: `../../backend/api/ApiAdmin.php?deleteCustomer&id=${id}`,
      method: "POST",
      successMessage: "Customer deleted successfully.",
      onSuccess: loadCustomers,
      onError: err => handleResponse(err, {})
    });
  }

  function bindCustomerEvents() {
    $tableBody
      .on("click", ".edit-customer", e => {
        const id = $(e.currentTarget).closest("tr").data("id");
        openCustomerModal(id);
      })
      .on("click", ".delete-customer", e => {
        const id = $(e.currentTarget).closest("tr").data("id");
        deleteCustomer(id);
      });

    $("#saveCustomerBtn").on("click", saveCustomer);
    $("#addCustomerBtn").on("click", () => openCustomerModal());  
  }

  // Initialisierung
  $(function() {
    loadCustomers();
    bindCustomerEvents();
  });
})(window, jQuery);
