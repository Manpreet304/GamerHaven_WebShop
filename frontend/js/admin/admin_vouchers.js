// admin.vouchers.js
(function(window, $) {
  function loadVouchers() {
    $.get("../../backend/api/ApiAdmin.php?listVouchers")
      .done(vouchers => {
        const tbody = $("#vouchersTable tbody").empty();
        vouchers.forEach(v => {
          const cls = v.is_active ? "" : "table-secondary";
          tbody.append(`
            <tr class="${cls}">
              <td>${v.id}</td>
              <td>${v.code}</td>
              <td>€${Number(v.value).toFixed(2)}</td>
              <td>€${Number(v.remaining_value).toFixed(2)}</td>
              <td>${v.expires_at.split(" ")[0]}</td>
              <td>${v.is_active ? "✔️" : "❌"}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-voucher" data-id="${v.id}">Edit</button>
              </td>
            </tr>
          `);
        });
      })
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Vouchers could not be loaded."
      }));
  }

  function openVoucherModal(id) {
    resetForm("#voucherForm");
    $("#voucherId").val("");
    $("#voucherCode").prop("readonly", false).val("");

    const loadCode = () =>
      $.get("../../backend/api/ApiAdmin.php?generateVoucherCode")
        .done(d => $("#voucherCode").val(d.code).prop("readonly", true))
        .fail(xhr => handleResponse(xhr.responseJSON || {}, {
          errorMessage: "Voucher code could not be generated."
        }));

    if (id) {
      $.get(`../../backend/api/ApiAdmin.php?getVoucher&id=${id}`)
        .done(v => {
          $("#voucherId").val(v.id);
          $("#voucherCode").val(v.code).prop("readonly", true);
          $("#voucherValue").val(v.value);
          $("#voucherExpires").val(v.expires_at.split(" ")[0]);
          $("#voucherActive").val(v.is_active ? "1" : "0");
        })
        .fail(xhr => handleResponse(xhr.responseJSON || {}, {
          errorMessage: "Voucher data could not be loaded."
        }));
    } else {
      loadCode();
    }

    new bootstrap.Modal(document.getElementById("voucherModal")).show();
  }

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
      url,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(data)
    })
      .done(resp => handleResponse(resp, {
        successMessage: data.id ? "Voucher updated successfully." : "Voucher created successfully.",
        onSuccess: () => {
          loadVouchers();
          bootstrap.Modal.getInstance(document.getElementById("voucherModal")).hide();
        }
      }))
      .fail(xhr => handleResponse(xhr.responseJSON ||={}, {
        errorMessage: "Error saving voucher."
      }));
  }

  function bindVoucherEvents() {
    $("#addVoucherBtn").click(() => openVoucherModal());
    $(document).on("click", ".edit-voucher", e =>
      openVoucherModal($(e.currentTarget).data("id"))
    );
    $("#saveVoucherBtn").click(saveVoucher);
  }

  $(function() {
    loadVouchers();
    bindVoucherEvents();
  });
})(window, jQuery);
