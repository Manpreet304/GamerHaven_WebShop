// admin.vouchers.js
(function(window, $) {
  const $tbody = $("#vouchersTable tbody");
  const voucherModalEl = document.getElementById("voucherModal");
  const voucherModal   = new bootstrap.Modal(voucherModalEl);

  function loadVouchers() {
    apiRequest({
      url: "../../backend/api/ApiAdmin.php?listVouchers",
      method: "GET",
      successMessage: null,
      errorMessage: "Vouchers could not be loaded.",
      onSuccess: res => {
        const vouchers = res.data; // Array of vouchers
        $tbody.empty();
        vouchers.forEach(v => {
          const cls = v.is_active ? "" : "table-secondary";
          $tbody.append(`
            <tr class="${cls}" data-id="${v.id}">
              <td>${v.id}</td>
              <td>${v.code}</td>
              <td>€${Number(v.value).toFixed(2)}</td>
              <td>€${Number(v.remaining_value).toFixed(2)}</td>
              <td>${v.expires_at.split(" ")[0]}</td>
              <td>${v.is_active ? "✔️" : "❌"}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-voucher">Edit</button>
              </td>
            </tr>
          `);
        });
      }
    });
  }

  function generateVoucherCode(callback) {
    apiRequest({
      url: "../../backend/api/ApiAdmin.php?generateVoucherCode",
      method: "GET",
      successMessage: null,
      errorMessage: "Voucher code could not be generated.",
      onSuccess: res => {
        callback(res.data.code);
      }
    });
  }

  function openVoucherModal(id) {
    resetForm("#voucherForm");
    $("#voucherId").val("");
    $("#voucherCode").prop("readonly", false).val("");

    if (id) {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?getVoucher&id=${id}`,
        method: "GET",
        successMessage: null,
        errorMessage: "Voucher data could not be loaded.",
        onSuccess: res => {
          const v = res.data;
          $("#voucherId").val(v.id);
          $("#voucherCode").val(v.code).prop("readonly", true);
          $("#voucherValue").val(v.value);
          $("#voucherExpires").val(v.expires_at.split(" ")[0]);
          $("#voucherActive").val(v.is_active ? "1" : "0");
          voucherModal.show();
        }
      });
    } else {
      generateVoucherCode(code => {
        $("#voucherCode").val(code).prop("readonly", true);
        voucherModal.show();
      });
    }
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

    apiRequest({
      url,
      method: "POST",
      data,
      successMessage: data.id ? "Voucher updated successfully." : "Voucher created successfully.",
      errorMessage: "Error saving voucher.",
      onSuccess: () => {
        loadVouchers();
        voucherModal.hide();
      }
    });
  }

  function bindVoucherEvents() {
    $("#addVoucherBtn").on("click", () => openVoucherModal());
    $tbody.on("click", ".edit-voucher", function() {
      const id = $(this).closest("tr").data("id");
      openVoucherModal(id);
    });
    $("#saveVoucherBtn").on("click", saveVoucher);
  }

  $(function() {
    loadVouchers();
    bindVoucherEvents();
  });
})(window, jQuery);
