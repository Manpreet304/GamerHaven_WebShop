// /admin/vouchers.js

$(document).ready(function () {
  loadVouchers();
  bindVoucherEvents();
});

/** ------------------- VOUCHER LADEN ------------------- **/

function loadVouchers() {
  $.get("../../backend/api/ApiAdmin.php?listVouchers")
    .done(function (vouchers) {
      const tbody = $("#vouchersTable tbody").empty();

      vouchers.forEach(function (voucher) {
        const cls = voucher.is_active ? "" : "table-secondary";
        tbody.append(`
          <tr class="${cls}">
            <td>${voucher.id}</td>
            <td>${voucher.code}</td>
            <td>€${Number(voucher.value).toFixed(2)}</td>
            <td>€${Number(voucher.remaining_value).toFixed(2)}</td>
            <td>${voucher.expires_at.split(" ")[0]}</td>
            <td>${voucher.is_active ? "✔️" : "❌"}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-voucher" data-id="${voucher.id}">Edit</button>
            </td>
          </tr>
        `);
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load vouchers." });
    });
}

/** ------------------- VOUCHER MODAL ÖFFNEN ------------------- **/

function openVoucherModal(id) {
  resetForm("#voucherForm");
  $("#voucherId").val("");
  $("#voucherCode").prop("readonly", false).val("");

  // Falls neuer Gutschein → automatisch Code generieren
  const loadCode = function () {
    $.get("../../backend/api/ApiAdmin.php?generateVoucherCode")
      .done(function (data) {
        $("#voucherCode").val(data.code).prop("readonly", true);
      })
      .fail(function (xhr) {
        handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to generate voucher code." });
      });
  };

  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getVoucher&id=${id}`)
      .done(function (voucher) {
        $("#voucherId").val(voucher.id);
        $("#voucherCode").val(voucher.code).prop("readonly", true);
        $("#voucherValue").val(voucher.value);
        $("#voucherExpires").val(voucher.expires_at.split(" ")[0]);
        $("#voucherActive").val(voucher.is_active ? "1" : "0");
      })
      .fail(function (xhr) {
        handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load voucher details." });
      });
  } else {
    loadCode();
  }

  new bootstrap.Modal(document.getElementById("voucherModal")).show();
}

/** ------------------- VOUCHER SPEICHERN ------------------- **/

function saveVoucher() {
  const form = $("#voucherForm")[0];
  if (!form.checkValidity()) {
    form.classList.add("was-validated");
    return;
  }

  const data = {
    id: +$("#voucherId").val(),
    code: $("#voucherCode").val(),
    value: +$("#voucherValue").val(),
    expires_at: $("#voucherExpires").val(),
    is_active: +$("#voucherActive").val()
  };

  const url = data.id
    ? `../../backend/api/ApiAdmin.php?updateVoucher&id=${data.id}`
    : `../../backend/api/ApiAdmin.php?addVoucher`;

  $.ajax({
    url: url,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data)
  })
    .done(function (response) {
      handleResponse(response, {
        successMessage: data.id ? "Voucher updated successfully." : "Voucher created successfully.",
        onSuccess: function () {
          loadVouchers();
          bootstrap.Modal.getInstance(document.getElementById("voucherModal")).hide();
        }
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to save voucher." });
    });
}

/** ------------------- EVENTS BINDEN ------------------- **/

function bindVoucherEvents() {
  // Neuer Gutschein erstellen
  $("#addVoucherBtn").click(function () {
    openVoucherModal();
  });

  // Bestehenden Gutschein bearbeiten
  $(document).on("click", ".edit-voucher", function (e) {
    openVoucherModal($(e.currentTarget).data("id"));
  });

  // Speichern
  $("#saveVoucherBtn").click(saveVoucher);
}
