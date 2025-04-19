// ----------------------- DOCUMENT READY -----------------------
$(document).ready(() => {
  initTooltips();
  loadProducts();
  loadCustomers();
  loadVouchers();
  bindUIEvents();
});

// ----------------------- AJAX CALLS -----------------------
function loadProducts() {
    $.get("../../backend/api/ApiAdmin.php?listProducts")
      .done(products => {
        const tbody = $("#productsTable tbody").empty();
        products.forEach(p => {
          tbody.append(`
            <tr>
              <td>${p.id}</td>
              <td>${p.name}</td>
              <td>€${parseFloat(p.price).toFixed(2)}</td>
              <td>${p.stock}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-product" data-id="${p.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-product" data-id="${p.id}">Delete</button>
              </td>
            </tr>`);
        });
      });
  }

function loadCustomers() {
  $.get("../../backend/api/ApiAdmin.php?listCustomers")
    .done(users => {
      const tbody = $("#customersTable tbody").empty();
      users.forEach(u => {
        tbody.append(`
          <tr>
            <td>${u.id}</td>
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.is_active ? 'Yes' : 'No'}</td>
            <td>
              <button class="btn btn-sm btn-warning toggle-customer" data-id="${u.id}">
                ${u.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>`);
      });
    })
    .fail((xhr, status, err) => {
      console.error("❌ Failed to loadCustomers:", xhr.responseText);
    });
}

function loadVouchers() {
    $.get("../../backend/api/ApiAdmin.php?listVouchers")
      .done(vs => {
        const tbody = $("#vouchersTable tbody").empty();
        vs.forEach(v =>
          tbody.append(`
            <tr>
              <td>${v.id}</td>
              <td>${v.code}</td>
              <td>€${parseFloat(v.value).toFixed(2)}</td>
              <td>€${parseFloat(v.remaining_value).toFixed(2)}</td>
              <td>${v.is_active ? 'Yes' : 'No'}</td>
              <td>${v.expires_at}</td>
              <td>
                <button class="btn btn-sm btn-primary edit-voucher" data-id="${v.id}">Edit</button>
                <button class="btn btn-sm btn-danger delete-voucher" data-id="${v.id}">Delete</button>
              </td>
            </tr>`));
      });
  }

// ----------------------- UI INIT -----------------------
function initTooltips() {
  $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
}

// ----------------------- EVENT BINDING -----------------------
function bindUIEvents() {
  // Products
  $("#addProductBtn").click(() => openProductModal());
  $(document).on("click", ".edit-product", e => openProductModal(+$(e.currentTarget).data("id")));
  $(document).on("click", "#saveProductBtn", saveProduct);
  $(document).on("click", ".delete-product", e => deleteProduct(+$(e.currentTarget).data("id")));

  // Customers
  $(document).on("click", ".toggle-customer", e => toggleCustomer(+$(e.currentTarget).data("id")));

  // Vouchers
  $("#addVoucherBtn").click(() => openVoucherModal());
  $(document).on("click", ".edit-voucher", e => openVoucherModal(+$(e.currentTarget).data("id")));
  $(document).on("click", "#saveVoucherBtn", saveVoucher);
  $(document).on("click", ".delete-voucher", e => deleteVoucher(+$(e.currentTarget).data("id")));
}

// ----------------------- PRODUCT LOGIC -----------------------
function openProductModal(id) {
  resetForm("#productForm");
  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getProduct&id=${id}`)
      .done(p => {
        $("#product_id").val(p.id);
        $("#product_name").val(p.name);
        $("#product_description").val(p.description);
        $("#product_price").val(p.price);
        $("#product_stock").val(p.stock);
        $("#product_rating").val(p.rating);
      });
  }
  new bootstrap.Modal($("#productModal")).show();
}

function saveProduct() {
  const data = {
    id: +$("#product_id").val(),
    name: $("#product_name").val(),
    description: $("#product_description").val(),
    price: +$("#product_price").val(),
    stock: +$("#product_stock").val(),
    rating: +$("#product_rating").val()
  };
  $.ajax({
    url: `../../backend/api/ApiAdmin.php?${data.id ? "updateProduct&id="+data.id : "addProduct"}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data)
  }).always(() => {
    bootstrap.Modal.getInstance($("#productModal")).hide();
    loadProducts();
  });
}

function deleteProduct(id) {
  $.post(`../../backend/api/ApiAdmin.php?deleteProduct&id=${id}`)
    .always(loadProducts);
}

// ----------------------- CUSTOMER LOGIC -----------------------
function toggleCustomer(id) {
  $.post(`../../backend/api/ApiAdmin.php?toggleCustomer&id=${id}`)
    .always(loadCustomers);
}

// ----------------------- VOUCHER LOGIC -----------------------
function openVoucherModal(id) {
  resetForm("#voucherForm");
  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getVoucher&id=${id}`)
      .done(v => {
        $("#voucher_id").val(v.id);
        $("#voucher_code").val(v.code);
        $("#voucher_value").val(v.value);
        $("#voucher_expires").val(v.expires_at.split(" ")[0]);
        $("#voucher_active").val(v.is_active ? "1" : "0");
      });
  }
  new bootstrap.Modal($("#voucherModal")).show();
}

function saveVoucher() {
  const data = {
    id: +$("#voucher_id").val(),
    code: $("#voucher_code").val(),
    value: +$("#voucher_value").val(),
    expires_at: $("#voucher_expires").val(),
    is_active: +$("#voucher_active").val()
  };
  $.ajax({
    url: `../../backend/api/ApiAdmin.php?${data.id ? "updateVoucher&id="+data.id : "addVoucher"}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(data)
  }).always(() => {
    bootstrap.Modal.getInstance($("#voucherModal")).hide();
    loadVouchers();
  });
}

function deleteVoucher(id) {
  $.post(`../../backend/api/ApiAdmin.php?deleteVoucher&id=${id}`)
    .always(loadVouchers);
}

// ----------------------- UTIL -----------------------
function resetForm(sel) {
  const f = document.querySelector(sel);
  f.reset();
  f.classList.remove("was-validated");
}
