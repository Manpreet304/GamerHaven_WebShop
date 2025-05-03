/**
 * js/admin/vouchers/admin_vouchers.js
 * Verantwortlich für Laden, Anzeigen und Verwalten von Gutscheinen im Admin-Bereich
 */
(function(window, $) {
  'use strict';

  // --- Selektoren & Modal-Instanz für Gutscheine ---
  const vouchersTableBody   = document.querySelector('#vouchersTable tbody');
  const voucherFormElement  = document.getElementById('voucherForm');
  const voucherModalElement = document.getElementById('voucherModal');
  const voucherModal        = new bootstrap.Modal(voucherModalElement);

  // --- Promise-basierte API-Funktionen ---
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
  function submitVoucherData(voucherData, isUpdate) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: isUpdate
          ? `../../backend/api/ApiAdmin.php?updateVoucher&id=${voucherData.id}`
          : `../../backend/api/ApiAdmin.php?addVoucher`,
        method: 'POST',
        data: voucherData,
        successMessage: isUpdate
          ? 'Voucher updated successfully.'
          : 'Voucher created successfully.',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // --- View-/Render-Funktionen: Tabelle & Modal ---
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
        <td>${v.expires_at.split(' ')[0]}</td>
        <td>${v.is_active ? '✔️' : '❌'}</td>
        <td><button class="btn btn-sm btn-primary edit-voucher">Edit</button></td>
      `;
      vouchersTableBody.appendChild(row);
    });
  }
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

  // --- Event-Handler für Add, Edit, Save ---
  function handleAddVoucherClick() {
    generateNewVoucherCode()
      .then(res => openVoucherModal({ code: res.data.code }))
      .catch(() => {});
  }
  function handleEditVoucherClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    fetchVoucherData(id)
      .then(res => openVoucherModal(res.data))
      .catch(() => {});
  }
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
      .catch(() => {});
  }

  // --- Events binden: Buttons & Delegation ---
  function bindVoucherEvents() {
    document.getElementById('addVoucherBtn')
      .addEventListener('click', handleAddVoucherClick);
    $(vouchersTableBody)
      .on('click', '.edit-voucher', handleEditVoucherClick);
    document.getElementById('saveVoucherBtn')
      .addEventListener('click', handleSaveVoucherClick);
  }

  // --- Initialisierung: Laden & Events binden ---
  function loadAndRenderVouchers() {
    fetchAllVouchers()
      .then(res => renderVouchersTable(res.data))
      .catch(() => {});
  }
  document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderVouchers();
    bindVoucherEvents();
  });

})(window, jQuery);
