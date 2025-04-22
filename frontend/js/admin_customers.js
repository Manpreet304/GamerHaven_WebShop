// admin_customers.js
$(function(){
  loadCustomers();
  bindCustomerEvents();
});

// 1) Alle Kunden laden und Tabelle rendern
function loadCustomers() {
  $.getJSON('../../backend/api/ApiAdmin.php?listCustomers')
    .done(users => {
      const $tb = $('#customersTable tbody').empty();
      users.forEach(u => {
        const active = u.is_active === 'true';
        $tb.append(`
          <tr data-id="${u.id}">
            <td>${u.id}</td>
            <td>${u.firstname} ${u.lastname}</td>
            <td>${u.email}</td>
            <td class="cell-active">${active ? '✔️' : '❌'}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-customer" data-id="${u.id}">Edit</button>
            </td>
          </tr>
        `);
      });
    })
    .fail((xhr, status, err) => {
      const msg = xhr.responseJSON?.error || 'Kunden konnten nicht geladen werden.';
      showMessage('danger', msg);
      console.error('loadCustomers failed', status, err);
    });
}

// 2) Modal öffnen und Felder befüllen
function openCustomerModal(id) {
  resetForm('#customerForm');
  $('#customer_password').val('');

  if (id) {
    $.getJSON(`../../backend/api/ApiAdmin.php?getCustomer&id=${id}`)
      .done(u => {
        $('#customer_id').val(u.id);
        $('#customer_firstname').val(u.firstname);
        $('#customer_lastname').val(u.lastname);
        $('#customer_email').val(u.email);
        $('#customer_username').val(u.username);
        $('#customer_salutation').val(u.salutation);
        $('#customer_role').val(u.role);
        $('#customer_active').val(u.is_active === 'true' ? '1' : '0');
        $('#customer_address').val(u.address === '0' ? '' : u.address);
        $('#customer_zip_code').val(u.zip_code === '0' ? '' : u.zip_code);
        $('#customer_city').val(u.city === '0' ? '' : u.city);
        $('#customer_country').val(u.country === '0' ? '' : u.country);
      })
      .fail((xhr, status, err) => {
        const msg = xhr.responseJSON?.error || 'Kundendaten konnten nicht geladen werden.';
        showMessage('danger', msg);
        console.error('getCustomer failed', status, err);
      });
  }

  new bootstrap.Modal(document.getElementById('customerModal')).show();
}

// 3) Änderungen speichern
function saveCustomer() {
  const form = document.getElementById('customerForm');
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const payload = {
    id:         +$('#customer_id').val(),
    firstname:  $('#customer_firstname').val(),
    lastname:   $('#customer_lastname').val(),
    email:      $('#customer_email').val(),
    username:   $('#customer_username').val(),
    salutation: $('#customer_salutation').val(),
    role:       $('#customer_role').val(),
    is_active:  +$('#customer_active').val(),
    address:    $('#customer_address').val()    || null,
    zip_code:   $('#customer_zip_code').val()   || null,
    city:       $('#customer_city').val()       || null,
    country:    $('#customer_country').val()    || null
  };
  const pw = $('#customer_password').val().trim();
  if (pw) payload.password = pw;

  $.ajax({
    url:         `../../backend/api/ApiAdmin.php?updateCustomer&id=${payload.id}`,
    method:      'POST',
    contentType: 'application/json',
    data:        JSON.stringify(payload)
  })
  .done(resp => {
    if (resp.success) {
      // Zeile updaten
      const $row = $(`#customersTable tbody tr[data-id="${payload.id}"]`);
      $row.find('td:nth-child(2)').text(`${payload.firstname} ${payload.lastname}`);
      $row.find('td:nth-child(3)').text(payload.email);
      $row.find('td.cell-active').text(payload.is_active ? '✔️' : '❌');
      showMessage('success', 'Kunde erfolgreich gespeichert.');
    } else {
      const msg = resp.error || 'Speichern des Kunden fehlgeschlagen.';
      showMessage('danger', msg);
    }
  })
  .fail((xhr, status, err) => {
    const msg = xhr.responseJSON?.error || 'Fehler beim Speichern des Kunden.';
    showMessage('danger', msg);
    console.error('saveCustomer failed', status, err);
  })
  .always(() => {
    bootstrap.Modal.getInstance(document.getElementById('customerModal')).hide();
  });
}

// 4) Events binden
function bindCustomerEvents() {
  $(document).on('click', '.edit-customer', e =>
    openCustomerModal($(e.currentTarget).data('id'))
  );
  $('#saveCustomerBtn').click(saveCustomer);
}