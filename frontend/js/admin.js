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

// --- PRODUCTS ---
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

// Open the Add/Edit Product modal and populate if editing
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

      // Attributes → textarea lines
      if (p.attributes) {
        const attrs = JSON.parse(p.attributes);
        const lines = Object.entries(attrs).map(([k, v]) => `${k}: ${v}`);
        $('#productAttributes').val(lines.join('\n'));
      }

      // Show existing images
      if (p.image_url) {
        JSON.parse(p.image_url).forEach(src => {
          $('#existingImages').append(`<li class="list-group-item">${src}</li>`);
        });
      }
    });
  }

  new bootstrap.Modal($('#productModal')).show();
}

// Save (Add or Update) a product
$('#saveProductBtn').click(() => {
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

  // Determine endpoint
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
    bootstrap.Modal.getInstance($('#productModal')).hide();
    loadProducts();
  });
});

// Bind product buttons
$('#addProductBtn').click(() => openProductModal());
$(document).on('click', '.edit-product', e => openProductModal($(e.currentTarget).data('id')));
$(document).on('click', '.delete-product', function() {
  const id = $(this).data('id');
  $.post(`../../backend/api/ApiAdmin.php?deleteProduct&id=${id}`, loadProducts);
});

// --- CUSTOMERS ---
function loadCustomers() {
  $.get('../../backend/api/ApiAdmin.php?listCustomers', customers => {
    const tbody = $('#customersTable tbody').empty();
    const select = $('#orderCustomerSelect').empty()
      .append('<option value="">Select customer…</option>');
    customers.forEach(u => {
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

// --- ORDERS BY CUSTOMER ---
$('#orderCustomerSelect').on('change', function() {
  const userId = $(this).val();
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
});

// Show order items
$('#ordersTable').on('click', '.view-items', function() {
  const orderId = $(this).data('id');
  $.get(`../../backend/api/ApiAdmin.php?listOrderItems&order_id=${orderId}`, items => {
    let msg = 'Items:\n';
    items.forEach(i => {
      msg += `– ${i.name_snapshot} × ${i.quantity} = €${i.total_price}\n`;
    });
    alert(msg);
  });
});

// --- VOUCHERS ---
function loadVouchers() {
  $.get('../../backend/api/ApiAdmin.php?listVouchers', vs => {
    const tbody = $('#vouchersTable tbody').empty();
    vs.forEach(v => {
      const rowClass = !v.is_active
        ? 'table-secondary'
        : (v.remaining_value < v.value ? 'table-warning' : '');
      tbody.append(`
        <tr class="${rowClass}">
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

// --- EVENT BINDING ---
function bindEvents() {
  // Customer toggle
  $('#customersTable').on('click', '.toggle-customer', function() {
    const id = $(this).data('id');
    $.post(`../../backend/api/ApiAdmin.php?toggleCustomer&id=${id}`, loadCustomers);
  });

  // Voucher: Add
  $('#addVoucherBtn').click(() => {
    $('#voucherForm')[0].reset();
    $('#voucherId').val('');
    $.get('../../backend/api/ApiAdmin.php?generateVoucherCode', d => {
      $('#voucherCode').val(d.code);
      new bootstrap.Modal($('#voucherModal')).show();
    });
  });

  // Voucher: Edit
  $('#vouchersTable').on('click', '.edit-voucher', function() {
    const id = $(this).data('id');
    $.get(`../../backend/api/ApiAdmin.php?getVoucher&id=${id}`, v => {
      $('#voucherId').val(v.id);
      $('#voucherCode').val(v.code);
      $('#voucherValue').val(v.value);
      $('#voucherExpires').val(v.expires_at.split(' ')[0]);
      $('#voucherActive').val(v.is_active ? '1' : '0');
      new bootstrap.Modal($('#voucherModal')).show();
    });
  });

  // Voucher: Save
  $('#saveVoucherBtn').click(() => {
    const id = $('#voucherId').val();
    const payload = {
      code: $('#voucherCode').val(),
      value: parseFloat($('#voucherValue').val()),
      expires_at: $('#voucherExpires').val(),
      is_active: parseInt($('#voucherActive').val(), 10)
    };
    const url = id
      ? `../../backend/api/ApiAdmin.php?updateVoucher&id=${id}`
      : `../../backend/api/ApiAdmin.php?addVoucher`;
    $.ajax({ url, method:'POST', contentType:'application/json', data: JSON.stringify(payload) })
      .always(() => { bootstrap.Modal.getInstance($('#voucherModal')).hide(); loadVouchers(); });
  });

  // Voucher: Deactivate
  $('#vouchersTable').on('click', '.delete-voucher', function() {
    const id = $(this).data('id');
    $.post(`../../backend/api/ApiAdmin.php?deleteVoucher&id=${id}`, loadVouchers);
  });
}

// Reset form helper
function resetForm(sel) {
  const f = document.querySelector(sel);
  f.reset();
  f.classList.remove('was-validated');
}
