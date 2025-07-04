(function(window, $) {
  'use strict';

  // [1] DOM-Elemente vorbereiten
  const vouchersTableBody   = document.querySelector('#vouchersTable tbody');
  const voucherFormElement  = document.getElementById('voucherForm');
  const voucherModalElement = document.getElementById('voucherModal');
  const voucherModal        = new bootstrap.Modal(voucherModalElement);

  // [2] Alle Gutscheine laden
  function fetchAllVouchers() {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: '../../backend/api/ApiAdmin.php?listVouchers',
        method: 'GET',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // [3] Einzelnen Gutschein abrufen
  function fetchVoucherData(voucherId) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?getVoucher&id=${voucherId}`,
        method: 'GET',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // [4] Neuen Gutscheincode generieren
  function generateNewVoucherCode() {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: '../../backend/api/ApiAdmin.php?generateVoucherCode',
        method: 'GET',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // [5] Gutschein speichern (neu oder aktualisieren)
  function submitVoucherData(voucherData, isUpdate) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: isUpdate
          ? '../../backend/api/ApiAdmin.php?updateVoucher'
          : '../../backend/api/ApiAdmin.php?addVoucher',
        method: 'POST',
        data: voucherData,
        successMessage: isUpdate
          ? 'Voucher updated successfully.'
          : 'Voucher created successfully.',
        onSuccess: resolve,
        onError: err => {
          handleResponse(err, {});
          reject(err);
        }
      });
    });
  }

  // [6] Tabelle mit Gutscheinen rendern
  function renderVouchersTable(vouchers) {
    vouchersTableBody.innerHTML = '';
    vouchers.forEach(v => {
      const row = document.createElement('tr');
      row.dataset.id  = v.id;
      row.className   = v.is_active ? '' : 'table-secondary';
      row.innerHTML = `
        <td>${v.id}</td>
        <td>${v.code}</td>
        <td>€${Number(v.value).toFixed(2)}</td>
        <td>€${Number(v.remaining_value).toFixed(2)}</td>
        <td>${v.expires_at?.split(' ')[0] || '-'}</td>
        <td>${v.is_active ? '✔️' : '❌'}</td>
        <td><button class="btn btn-sm btn-primary edit-voucher">Edit</button></td>
      `;
      vouchersTableBody.appendChild(row);
    });
  }

  // [7] Modal öffnen mit Gutscheinwerten
  function openVoucherModal(v = {}) {
    voucherFormElement.classList.remove('was-validated');
    $('#voucherForm')[0].reset();

    $('#voucherId').val(v.id || '');
    $('#voucherCode')
      .prop('readonly', Boolean(v.id))
      .val(v.code || '');
    $('#voucherValue').val(v.value || '');
    $('#voucherExpires').val(v.expires_at ? v.expires_at.split(' ')[0] : '');
    $('#voucherActive').val(v.is_active ? '1' : '0');

    voucherModal.show();
  }

  // [8] Neuer Gutschein: Code generieren & Modal öffnen
  function handleAddVoucherClick() {
    generateNewVoucherCode()
      .then(data => openVoucherModal({ code: data.code }))
      .catch(err => console.error('Generate code failed', err));
  }

  // [9] Bestehenden Gutschein bearbeiten
  function handleEditVoucherClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    fetchVoucherData(id)
      .then(data => openVoucherModal(data))
      .catch(err => console.error('Fetch voucher failed', err));
  }

  // [10] Gutschein speichern
  function handleSaveVoucherClick() {
    if (!voucherFormElement.checkValidity()) {
      voucherFormElement.classList.add('was-validated');
      return;
    }

    const voucherData = {
      id:         +$('#voucherId').val(),
      code:       $('#voucherCode').val(),
      value:      +$('#voucherValue').val(),
      expires_at: $('#voucherExpires').val(),
      is_active:  +$('#voucherActive').val()
    };
    const isUpdate = Boolean(voucherData.id);

    submitVoucherData(voucherData, isUpdate)
      .then(() => {
        voucherModal.hide();
        loadAndRenderVouchers();
      })
      .catch(err => console.error("Voucher save failed", err));
  }

  // [11] Event-Listener verbinden
  function bindVoucherEvents() {
    document.getElementById('addVoucherBtn')
      .addEventListener('click', handleAddVoucherClick);
    $(vouchersTableBody)
      .on('click', '.edit-voucher', handleEditVoucherClick);
    document.getElementById('saveVoucherBtn')
      .addEventListener('click', handleSaveVoucherClick);
  }

  // [12] Alle Gutscheine laden & anzeigen
  function loadAndRenderVouchers() {
    fetchAllVouchers()
      .then(data => renderVouchersTable(data))
      .catch(err => console.error("Loading vouchers failed", err));
  }

  // [13] Initialisierung bei Seitenstart
  document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderVouchers();
    bindVoucherEvents();
  });

})(window, jQuery);