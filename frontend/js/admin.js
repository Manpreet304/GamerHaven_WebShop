$(document).ready(function() {
  initTabs();
  loadProducts();
  loadCustomers();
  loadVouchers();
  bindEvents();
});

// Initialize Bootstrap tabs
function initTabs() {
  document.querySelectorAll('#adminTabs button').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      new bootstrap.Tab(btn).show();
    });
  });
}

// --- PRODUCTS ---------------------------------------------------------
function loadProducts() {
  $.get('../../backend/api/ApiAdmin.php?listProducts', products => {
    const tbody = $('#productsTable tbody').empty();
    products.forEach(p => {
      tbody.append(`
        <tr>
          <td>${p.id}</td>
          <td>${p.name}</td>
          <td>€${Number(p.price).toFixed(2)}</td>
          <td>${p.rating ?? '-'}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-product" data-id="${p.id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-product" data-id="${p.id}">Delete</button>
          </td>
        </tr>
      `);
    });
  });
}

function openProductModal(id) {
  resetForm('#productForm');
  $('#existingImages').empty();

  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getProduct&id=${id}`, p => {
      $('#productId').val(p.id);
      $('#productName').val(p.name);
      $('#productBrand').val(p.brand);
      $('#productCategory').val(p.category);
      $('#productSubCategory').val(p.sub_category);
      $('#productPrice').val(p.price);
      $('#productStock').val(p.stock);
      $('#productRating').val(p.rating);
      $('#productDescription').val(p.description);

      // Attributes
      if (p.attributes) {
        const attrs = JSON.parse(p.attributes);
        const lines = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`);
        $('#productAttributes').val(lines.join('\n'));
      }

      // Existing images
      if (p.image_url) {
        JSON.parse(p.image_url).forEach(src => {
          $('#existingImages').append(`<li class="list-group-item">${src}</li>`);
        });
      }
    });
  }

  new bootstrap.Modal(document.getElementById('productModal')).show();
}

function saveProduct() {
  const formEl = $('#productForm')[0];
  if (!formEl.checkValidity()) {
    formEl.classList.add('was-validated');
    return;
  }

  const formData = new FormData(formEl);

  // Convert attributes textarea to JSON
  const raw = $('#productAttributes').val().split(/\r?\n/);
  const obj = {};
  raw.forEach(line => {
    const [key, val] = line.split(/:\s*/, 2);
    if (val !== undefined) obj[key.trim()] = val.trim();
  });
  formData.set('attributes', JSON.stringify(obj));

  const id = $('#productId').val();
  const url = id
    ? `../../backend/api/ApiAdmin.php?updateProduct&id=${id}`
    : `../../backend/api/ApiAdmin.php?addProduct`;

  $.ajax({
    url,
    method: 'POST',
    processData: false,
    contentType: false,
    data: formData
  }).always(() => {
    bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
    loadProducts();
  });
}

// --- CUSTOMERS -------------------------------------------------------
function loadCustomers() {
  $.get('../../backend/api/ApiAdmin.php?listCustomers', users => {
    const tbody = $('#customersTable tbody').empty();
    const select = $('#orderCustomerSelect').empty()
      .append('<option value="">Select customer…</option>');
    users.forEach(u => {
      tbody.append(`
        <tr>
          <td>${u.id}</td>
          <td>${u.firstname} ${u.lastname}</td>
          <td>${u.email}</td>
          <td>${u.is_active ? '✔️' : '❌'}</td>
          <td>
            <button class="btn btn-sm btn-warning toggle-customer" data-id="${u.id}">
              ${u.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </td>
        </tr>
      `);
      select.append(`<option value="${u.id}">${u.firstname} ${u.lastname}</option>`);
    });
  });
}

// --- ORDERS ----------------------------------------------------------
function loadOrdersByCustomer(userId) {
  const tbody  = $('#ordersTable tbody').empty();
  if (!userId) return;
  $.get(`../../backend/api/ApiAdmin.php?listOrdersByCustomer&id=${userId}`, orders => {
    orders.forEach(o => {
      tbody.append(`
        <tr>
          <td>${o.id}</td>
          <td>${o.created_at.split(' ')[0]}</td>
          <td>€${Number(o.total_amount).toFixed(2)}</td>
          <td>
            <button class="btn btn-sm btn-info view-items" data-id="${o.id}">Details</button>
          </td>
        </tr>
      `);
    });
  });
}

function loadOrderItems(orderId) {
  const body = $('#orderItemsBody').empty();
  $.get(`../../backend/api/ApiAdmin.php?listOrderItems&order_id=${orderId}`, items => {
    if (!items.length) {
      body.append('<p>No items in this order.</p>');
      return;
    }
    items.forEach(i => {
      body.append(`
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>${i.name_snapshot}</strong>
            <div>Qty: ${i.quantity} × €${i.price_snapshot}</div>
          </div>
          <button class="btn btn-sm btn-danger remove-item" data-id="${i.id}">Remove</button>
        </div>
      `);
    });
  });
}

// --- VOUCHERS --------------------------------------------------------
function loadVouchers() {
  $.get('../../backend/api/ApiAdmin.php?listVouchers', vs => {
    const tbody = $('#vouchersTable tbody').empty();
    vs.forEach(v => {
      const cls = !v.is_active
        ? 'table-secondary'
        : (v.remaining_value < v.value ? 'table-warning' : '');
      tbody.append(`
        <tr class="${cls}">
          <td>${v.id}</td>
          <td>${v.code}</td>
          <td>€${Number(v.value).toFixed(2)}</td>
          <td>€${Number(v.remaining_value).toFixed(2)}</td>
          <td>${v.expires_at.split(' ')[0]}</td>
          <td>${v.is_active ? '✔️' : '❌'}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-voucher" data-id="${v.id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-voucher" data-id="${v.id}">Deactivate</button>
          </td>
        </tr>
      `);
    });
  });
}

// --- EVENT BINDING --------------------------------------------------
function bindEvents() {
  // Products
  $('#addProductBtn').click(() => openProductModal());
  $(document).on('click', '.edit-product', e => openProductModal($(e.currentTarget).data('id')));
  $(document).on('click', '.delete-product', function() {
    $.post(`../../backend/api/ApiAdmin.php?deleteProduct&id=${$(this).data('id')}`, loadProducts);
  });
  $('#saveProductBtn').click(saveProduct);

  // Customers
  $('#customersTable').on('click', '.toggle-customer', function() {
    $.post(`../../backend/api/ApiAdmin.php?toggleCustomer&id=${$(this).data('id')}`, loadCustomers);
  });

  // Orders
  $('#orderCustomerSelect').on('change', function() {
    loadOrdersByCustomer($(this).val());
  });
  $(document).on('click', '.view-items', function() {
    loadOrderItems($(this).data('id'));
    new bootstrap.Modal(document.getElementById('orderItemsModal')).show();
  });
  $(document).on('click', '.remove-item', function() {
    $.post(`../../backend/api/ApiAdmin.php?removeOrderItem&id=${$(this).data('id')}`, () => {
      $('#orderItemsModal').modal('hide');
      $('#orderCustomerSelect').trigger('change');
    });
  });

  // Vouchers
  $('#addVoucherBtn').click(() => {
    $('#voucherForm')[0].reset();
    $('#voucherId').val('');
    $.get('../../backend/api/ApiAdmin.php?generateVoucherCode', d => {
      $('#voucherCode').val(d.code);
      new bootstrap.Modal(document.getElementById('voucherModal')).show();
    });
  });
  $(document).on('click', '.edit-voucher', function() {
    $.get(`../../backend/api/ApiAdmin.php?getVoucher&id=${$(this).data('id')}`, v => {
      $('#voucherId').val(v.id);
      $('#voucherCode').val(v.code);
      $('#voucherValue').val(v.value);
      $('#voucherExpires').val(v.expires_at.split(' ')[0]);
      $('#voucherActive').val(v.is_active ? '1' : '0');
      new bootstrap.Modal(document.getElementById('voucherModal')).show();
    });
  });
  $('#saveVoucherBtn').click(() => {
    const id = $('#voucherId').val();
    const payload = {
      code: $('#voucherCode').val(),
      value: parseFloat($('#voucherValue').val()),
      expires_at: $('#voucherExpires').val(),
      is_active: +$('#voucherActive').val()
    };
    const url = id
      ? `../../backend/api/ApiAdmin.php?updateVoucher&id=${id}`
      : `../../backend/api/ApiAdmin.php?addVoucher`;
    $.ajax({ url, method:'POST', contentType:'application/json', data: JSON.stringify(payload) })
      .always(() => {
        bootstrap.Modal.getInstance(document.getElementById('voucherModal')).hide();
        loadVouchers();
      });
  });
  $(document).on('click', '.delete-voucher', function() {
    $.post(`../../backend/api/ApiAdmin.php?deleteVoucher&id=${$(this).data('id')}`, loadVouchers);
  });
}

// Helper to reset and clear validation
function resetForm(selector) {
  const f = document.querySelector(selector);
  f.reset();
  f.classList.remove('was-validated');
}
