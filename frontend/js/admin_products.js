// admin_products.js
$(document).ready(function() {
  initTabs();
  loadProducts();
  bindProductEvents();
});

// --- TABS (only once) ---
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
  $.get('../../backend/api/ApiAdmin.php?listProducts')
    .done(products => {
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
    })
    .fail((xhr, status, err) => {
      const msg = xhr.responseJSON?.error || 'Produkte konnten nicht geladen werden.';
      showMessage('danger', msg);
      console.error('loadProducts failed', status, err);
    });
}

function openProductModal(id) {
  resetForm('#productForm');
  $('#existingImages').empty();
  if (id) {
    $.get(`../../backend/api/ApiAdmin.php?getProduct&id=${id}`)
      .done(p => {
        $('#productId').val(p.id);
        $('#productName').val(p.name);
        $('#productBrand').val(p.brand);
        $('#productCategory').val(p.category);
        $('#productSubCategory').val(p.sub_category);
        $('#productPrice').val(p.price);
        $('#productStock').val(p.stock);
        $('#productRating').val(p.rating);
        $('#productDescription').val(p.description);
        if (p.attributes) {
          const attrs = JSON.parse(p.attributes);
          $('#productAttributes').val(
            Object.entries(attrs).map(([k, v]) => `${k}: ${v}`).join('\n')
          );
        }
        if (p.image_url) {
          JSON.parse(p.image_url).forEach(src => {
            $('#existingImages').append(`<li class="list-group-item">${src}</li>`);
          });
        }
      })
      .fail((xhr, status, err) => {
        const msg = xhr.responseJSON?.error || 'Produktdaten konnten nicht geladen werden.';
        showMessage('danger', msg);
        console.error('getProduct failed', status, err);
      });
  }
  new bootstrap.Modal(document.getElementById('productModal')).show();
}

function saveProduct() {
  const form = $('#productForm')[0];
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }
  const fd = new FormData(form);
  const obj = {};
  $('#productAttributes').val().split(/\r?\n/).forEach(line => {
    const [k, v] = line.split(/:\s*/, 2);
    if (v !== undefined) obj[k.trim()] = v.trim();
  });
  fd.set('attributes', JSON.stringify(obj));

  const id  = $('#productId').val();
  const url = id
    ? `../../backend/api/ApiAdmin.php?updateProduct&id=${id}`
    : `../../backend/api/ApiAdmin.php?addProduct`;

  $.ajax({ url, method: 'POST', processData: false, contentType: false, data: fd })
    .done(resp => {
      if (resp.success) {
        showMessage('success', id ? 'Produkt erfolgreich aktualisiert.' : 'Produkt erfolgreich hinzugefügt.');
        loadProducts();
        bootstrap.Modal.getInstance(document.getElementById('productModal')).hide();
      } else {
        const msg = resp.error || 'Speichern des Produkts fehlgeschlagen.';
        showMessage('danger', msg);
      }
    })
    .fail((xhr, status, err) => {
      const msg = xhr.responseJSON?.error || 'Fehler beim Speichern des Produkts.';
      showMessage('danger', msg);
      console.error('saveProduct failed', status, err);
    });
}

function bindProductEvents() {
  $('#addProductBtn').click(() => openProductModal());
  $(document).on('click', '.edit-product', e =>
    openProductModal($(e.currentTarget).data('id'))
  );
  $(document).on('click', '.delete-product', function() {
    const id = $(this).data('id');
    $.post(`../../backend/api/ApiAdmin.php?deleteProduct&id=${id}`)
      .done(resp => {
        if (resp.success) {
          showMessage('success', 'Produkt gelöscht.');
          loadProducts();
        } else {
          const msg = resp.error || 'Löschen des Produkts fehlgeschlagen.';
          showMessage('danger', msg);
        }
      })
      .fail((xhr, status, err) => {
        const msg = xhr.responseJSON?.error || 'Fehler beim Löschen des Produkts.';
        showMessage('danger', msg);
        console.error('deleteProduct failed', status, err);
      });
  });
  $('#saveProductBtn').click(saveProduct);
}
