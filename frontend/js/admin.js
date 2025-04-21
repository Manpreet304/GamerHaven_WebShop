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
            <td>€${parseFloat(p.price).toFixed(2).replace('.', ',')}</td>
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
              <button class="btn btn-sm btn-primary edit-customer me-1" data-id="${u.id}">Edit</button>
              <button class="btn btn-sm btn-info view-orders me-1" data-id="${u.id}">Orders</button>
              <button class="btn btn-sm btn-warning toggle-customer" data-id="${u.id}">
                ${u.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>`);
      });
    });
}

function loadVouchers() {
  $.get("../../backend/api/ApiAdmin.php?listVouchers")
    .done(vs => {
      const tbody = $("#vouchersTable tbody").empty();
      const today = new Date().toISOString().split('T')[0];
      vs.forEach(v => {
        const isExpired = v.expires_at < today;
        const isUsed = v.remaining_value < v.value;
        const rowClass = isExpired ? 'table-danger' : isUsed ? 'table-warning' : '';
        tbody.append(`
          <tr class="${rowClass}">
            <td>${v.id}</td>
            <td>${v.code}</td>
            <td>€${parseFloat(v.value).toFixed(2)}</td>
            <td>€${parseFloat(v.remaining_value).toFixed(2)}</td>
            <td>${v.is_active ? 'Yes' : 'No'}</td>
            <td>${v.expires_at.split(' ')[0]}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-voucher" data-id="${v.id}">Edit</button>
              <button class="btn btn-sm btn-danger delete-voucher" data-id="${v.id}">Delete</button>
            </td>
          </tr>`);
      });
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
  $(document).on("click", ".edit-customer", e => openCustomerModal(+$(e.currentTarget).data("id")));
  $(document).on("click", "#saveCustomerBtn", saveCustomer);
  $(document).on("click", ".view-orders", e => showCustomerOrders(+$(e.currentTarget).data("id")));

  // Vouchers
  $("#addVoucherBtn").click(() => openVoucherModal());
  $(document).on("click", ".edit-voucher", e => openVoucherModal(+$(e.currentTarget).data("id")));
  $(document).on("click", "#saveVoucherBtn", saveVoucher);
  $(document).on("click", ".delete-voucher", e => deleteVoucher(+$(e.currentTarget).data("id")));
}

// ----------------------- PRODUCT LOGIC -----------------------
function openProductModal(id) {
  resetForm("#productForm");
  $("#existingImages").empty();

  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getProduct&id=${id}`)
      .done(p => {
        $("#product_id").val(p.id);
        $("#product_name").val(p.name);
        $("#product_brand").val(p.brand);
        $("#product_category").val(p.category);
        $("#product_sub_category").val(p.sub_category);
        $("#product_description").val(p.description);
        $("#product_price").val(parseFloat(p.price).toFixed(2).replace('.', ','));
        if (p.rating != null) {
          $("#product_rating").val(parseFloat(p.rating).toFixed(2).replace('.', ','));
        }
        $("#product_stock").val(p.stock);
        const attrs = JSON.parse(p.attributes || '{}');
        $("#product_attributes").val(Object.entries(attrs).map(([k,v]) => `${k}: ${v}`).join("\n"));
        JSON.parse(p.image_url || '[]').forEach(src => {
          $("#existingImages").append(`<li class="list-group-item">${src}</li>`);
        });
      });
  }

  new bootstrap.Modal($("#productModal")).show();
}

function saveProduct() {
  const formEl = $("#productForm")[0];
  if (!formEl.checkValidity()) {
    formEl.classList.add("was-validated");
    return;
  }
  const formData = new FormData(formEl);
  formData.set("price", $("#product_price").val().replace(',', '.'));
  const rv = $("#product_rating").val();
  if (rv) formData.set("rating", rv.replace(',', '.'));
  const lines = $("#product_attributes").val().split(/\r\n|\n/);
  const obj = {};
  lines.forEach(l => {
    const [k,v] = l.split(":",2);
    if (v !== undefined) obj[k.trim()] = v.trim();
  });
  formData.set("attributes", JSON.stringify(obj));
  const id = +$("#product_id").val();
  const url = id ? `../../backend/api/ApiAdmin.php?updateProduct&id=${id}` : `../../backend/api/ApiAdmin.php?addProduct`;
  $.ajax({
    url,
    method: "POST",
    processData: false,
    contentType: false,
    data: formData
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

function openCustomerModal(id) {
  resetForm("#customerForm");
  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getCustomer&id=${id}`)
      .done(u => {
        $("#customer_id").val(u.id);
        $("#customer_firstname").val(u.firstname);
        $("#customer_lastname").val(u.lastname);
        $("#customer_email").val(u.email);
        $("#customer_username").val(u.username);
        $("#customer_salutation").val(u.salutation);
        $("#customer_role").val(u.role);
        $("#customer_active").val(u.is_active ? "1" : "0");
        $("#customer_address").val(u.address);
        $("#customer_zip_code").val(u.zip_code);
        $("#customer_city").val(u.city);
        $("#customer_country").val(u.country);
      });
  }
  new bootstrap.Modal($("#customerModal")).show();
}

function saveCustomer() {
  const formEl = $("#customerForm")[0];
  if (!formEl.checkValidity()) {
    formEl.classList.add("was-validated");
    return;
  }
  const id = +$("#customer_id").val();
  const payload = {
    firstname:  $("#customer_firstname").val(),
    lastname:   $("#customer_lastname").val(),
    email:      $("#customer_email").val(),
    username:   $("#customer_username").val(),
    salutation: $("#customer_salutation").val(),
    role:       $("#customer_role").val(),
    is_active: +$("#customer_active").val(),
    address:    $("#customer_address").val(),
    zip_code:   $("#customer_zip_code").val(),
    city:       $("#customer_city").val(),
    country:    $("#customer_country").val()
  };
  if (id) payload.id = id;
  const pw = $("#customer_password").val();
  if (pw) payload.password = pw;
  $.ajax({
    url: `../../backend/api/ApiAdmin.php?${id ? `updateCustomer&id=${id}` : 'addCustomer'}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  }).always(() => {
    bootstrap.Modal.getInstance($("#customerModal")).hide();
    loadCustomers();
  });
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
        $("#voucher_expires").val(v.expires_at.split(' ')[0]);
        $("#voucher_active").val(v.is_active ? "1" : "0");
      });
  } else {
    $.get("../../backend/api/ApiAdmin.php?generateVoucherCode")
      .done(data => {
        $("#voucher_code").val(data.code).attr("readonly", true);
      });
  }
  new bootstrap.Modal($("#voucherModal")).show();
}

function saveVoucher() {
  const id = +$("#voucher_id").val();
  const payload = {
    code:       $("#voucher_code").val(),
    value:      +$("#voucher_value").val(),
    expires_at: $("#voucher_expires").val(),
    is_active:  +$("#voucher_active").val()
  };
  if (id) payload.id = id;
  $.ajax({
    url: `../../backend/api/ApiAdmin.php?${id ? `updateVoucher&id=${id}` : "addVoucher"}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(payload)
  }).always(() => {
    bootstrap.Modal.getInstance($("#voucherModal")).hide();
    loadVouchers();
  });
}

function deleteVoucher(id) {
  $.post(`../../backend/api/ApiAdmin.php?deleteVoucher&id=${id}`)
    .always(loadVouchers);
}

// ----------------------- ORDERS -----------------------
function showCustomerOrders(userId) {
  $.get(`../../backend/api/ApiAdmin.php?listOrdersByCustomer&id=${userId}`)
    .done(orders => {
      console.table(orders);
      alert(`User ${userId} has ${orders.length} order(s).`);
    });
}

// ----------------------- UTIL -----------------------
function resetForm(sel) {
  const f = document.querySelector(sel);
  f.reset();
  f.classList.remove("was-validated");
}