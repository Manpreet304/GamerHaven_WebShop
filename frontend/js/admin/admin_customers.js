/**
 * js/admin/customers/admin_customers.js
 * Verantwortlich für Laden, Anzeigen und Verwalten von Kunden im Admin-Bereich
 */
(function(window, $) {
  'use strict';

  // --- Selektoren & Modal-Instanz für Kunden ---
  const customersTableBody   = document.querySelector('#customersTable tbody');
  const customerFormElement  = document.getElementById('customerForm');
  const customerModalElement = document.getElementById('customerModal');
  const customerModal        = new bootstrap.Modal(customerModalElement);

  // --- Promise-basierte API-Funktionen ---
  function fetchAllCustomers() {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: '../../backend/api/ApiAdmin.php?listCustomers',
        method: 'GET',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }
  function fetchCustomerData(customerId) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?getCustomer&id=${customerId}`,
        method: 'GET',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }
  function submitCustomerData(customerData) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?updateCustomer&id=${customerData.id}`,
        method: 'POST',
        data: customerData,
        successMessage: 'Customer settings saved successfully.',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }
  function deleteCustomerById(customerId) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?deleteCustomer&id=${customerId}`,
        method: 'POST',
        successMessage: 'Customer deleted successfully.',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // --- View-/Render-Funktionen: Tabelle & Modal ---
  function renderCustomersTable(customers) {
    customersTableBody.innerHTML = '';
    customers.forEach(c => {
      const isActive = c.is_active === 'true' || c.is_active === true;
      const row = document.createElement('tr');
      row.dataset.id = c.id;
      row.className  = isActive ? '' : 'table-secondary';
      row.innerHTML = `
        <td>${c.id}</td>
        <td>${c.firstname} ${c.lastname}</td>
        <td>${c.username}</td>
        <td>${c.email}</td>
        <td>${isActive ? '✔️' : '❌'}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-customer">Edit</button>
          <button class="btn btn-sm btn-danger delete-customer">Delete</button>
        </td>
      `;
      customersTableBody.appendChild(row);
    });
  }
  function openCustomerModal(c = {}) {
    customerFormElement.classList.remove('was-validated');
    $('#customerForm')[0].reset();

    $('#customer_id').val(c.id || '');
    $('#customer_firstname').val(c.firstname || '');
    $('#customer_lastname').val(c.lastname || '');
    $('#customer_email').val(c.email || '');
    $('#customer_username').val(c.username || '');
    $('#customer_salutation').val(c.salutation || '');
    $('#customer_role').val(c.role || '');
    $('#customer_active').val(c.is_active === 'true' ? '1' : '0');
    $('#customer_address').val(c.address || '');
    $('#customer_zip_code').val(c.zip_code || '');
    $('#customer_city').val(c.city || '');
    $('#customer_country').val(c.country || '');
    $('#customer_password').val('');

    customerModal.show();
  }

  // --- Event-Handler für Add, Edit, Save, Delete ---
  function handleAddCustomerClick() {
    openCustomerModal();
  }
  function handleEditCustomerClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    fetchCustomerData(id)
      .then(res => openCustomerModal(res.data))
      .catch(() => {});
  }
  function handleSaveCustomerClick() {
    if (!customerFormElement.checkValidity()) {
      customerFormElement.classList.add('was-validated');
      return;
    }
    const customerData = {
      id:         +$('#customer_id').val(),
      firstname:  $('#customer_firstname').val(),
      lastname:   $('#customer_lastname').val(),
      email:      $('#customer_email').val(),
      username:   $('#customer_username').val(),
      salutation: $('#customer_salutation').val(),
      role:       $('#customer_role').val(),
      is_active:  +$('#customer_active').val(),
      address:    $('#customer_address').val() || null,
      zip_code:   $('#customer_zip_code').val() || null,
      city:       $('#customer_city').val() || null,
      country:    $('#customer_country').val() || null
    };
    const pw = $('#customer_password').val().trim();
    if (pw) customerData.password = pw;

    submitCustomerData(customerData)
      .then(() => {
        customerModal.hide();
        loadAndRenderCustomers();
      })
      .catch(() => {});
  }
  function handleDeleteCustomerClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    deleteCustomerById(id)
      .then(() => loadAndRenderCustomers())
      .catch(() => {});
  }

  // --- Events binden: Buttons & Delegation mit Null-Check ---
  function bindCustomerEvents() {
    const addBtn = document.getElementById('addCustomerBtn');
    if (addBtn) addBtn.addEventListener('click', handleAddCustomerClick);

    const saveBtn = document.getElementById('saveCustomerBtn');
    if (saveBtn) saveBtn.addEventListener('click', handleSaveCustomerClick);

    if (customersTableBody) {
      $(customersTableBody)
        .on('click', '.edit-customer', handleEditCustomerClick)
        .on('click', '.delete-customer', handleDeleteCustomerClick);
    }
  }

  // --- Initialisierung: Laden & Events binden ---
  function loadAndRenderCustomers() {
    fetchAllCustomers()
      .then(res => renderCustomersTable(res.data))
      .catch(() => {});
  }
  document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderCustomers();
    bindCustomerEvents();
  });

})(window, jQuery);
