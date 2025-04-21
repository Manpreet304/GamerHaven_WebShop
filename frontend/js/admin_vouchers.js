$(document).ready(function() {
    loadVouchers();
    bindVoucherEvents();
  });
  
  function loadVouchers() {
    $.get('../../backend/api/ApiAdmin.php?listVouchers', vs => {
      const tbody = $('#vouchersTable tbody').empty();
      vs.forEach(v => {
        const cls = v.is_active ? '' : 'table-secondary';
        tbody.append(`
          <tr class="${cls}">
            <td>${v.id}</td>
            <td>${v.code}</td>
            <td>€${Number(v.value).toFixed(2)}</td>
            <td>€${Number(v.remaining_value).toFixed(2)}</td>
            <td>${v.expires_at.split(' ')[0]}</td>
            <td>${v.is_active ? '✔️' : '❌'}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-voucher" data-id="${v.id}">
                Edit
              </button>
            </td>
          </tr>
        `);
      });
    });
  }
  
  function openVoucherModal(id) {
    resetForm('#voucherForm');
    $('#voucherId').val('');
    $('#voucherCode').prop('readonly', false).val('');
  
    if (id) {
      $.get(`../../backend/api/ApiAdmin.php?getVoucher&id=${id}`, v => {
        $('#voucherId').val(v.id);
        $('#voucherCode').val(v.code).prop('readonly', true);
        $('#voucherValue').val(v.value);
        $('#voucherExpires').val(v.expires_at.split(' ')[0]);
        $('#voucherActive').val(v.is_active ? '1' : '0');
      });
    } else {
      $.get('../../backend/api/ApiAdmin.php?generateVoucherCode', d => {
        $('#voucherCode').val(d.code).prop('readonly', true);
      });
    }
  
    new bootstrap.Modal(document.getElementById('voucherModal')).show();
  }
  
  function saveVoucher() {
    const form = $('#voucherForm')[0];
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }
  
    const data = {
      id:         +$('#voucherId').val(),
      code:       $('#voucherCode').val(),
      value:      +$('#voucherValue').val(),
      expires_at: $('#voucherExpires').val(),
      is_active:  +$('#voucherActive').val()
    };
  
    const url = data.id
      ? `../../backend/api/ApiAdmin.php?updateVoucher&id=${data.id}`
      : `../../backend/api/ApiAdmin.php?addVoucher`;
  
    $.ajax({
      url,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data)
    })
    .always(() => {
      bootstrap.Modal.getInstance(document.getElementById('voucherModal')).hide();
      loadVouchers();
    });
  }
  
  function bindVoucherEvents() {
    $('#addVoucherBtn').click(() => openVoucherModal());
    $(document).on('click', '.edit-voucher', e =>
      openVoucherModal($(e.currentTarget).data('id'))
    );
    $('#saveVoucherBtn').click(saveVoucher);
  }