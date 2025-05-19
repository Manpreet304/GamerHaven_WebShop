(function(window, $) {
  'use strict';

  // [1] DOM-Elemente vorbereiten
  const productsTableBody   = document.querySelector('#productsTable tbody');
  const productFormElement  = document.getElementById('productForm');
  const productModalElement = document.getElementById('productModal');
  const productModal        = new bootstrap.Modal(productModalElement);

  // [2] Alle Produkte laden
  function fetchAllProducts() {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: '../../backend/api/ApiAdmin.php?listProducts',
        method: 'GET',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // [3] Einzelnes Produkt abrufen
  function fetchProductData(productId) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?getProduct&id=${productId}`,
        method: 'GET',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // [4] Produkt speichern (neu oder Update)
  function submitProductData(formData, isUpdate) {
    return new Promise((resolve, reject) => {
      const url = isUpdate
        ? `../../backend/api/ApiAdmin.php?updateProduct&id=${formData.get('id')}`
        : `../../backend/api/ApiAdmin.php?addProduct`;

      $.ajax({
        url,
        method: 'POST',
        processData: false,
        contentType: false,
        data: formData,
        xhrFields: { withCredentials: true }
      })
      .done(response => {
        if (response.success) {
          showMessage("success", response.message || "Success");
          resolve(response.data);
        } else {
          handleResponse(response, {});
          reject(response);
        }
      })
      .fail(err => {
        handleResponse(err.responseJSON || {}, {});
        reject(err);
      });
    });
  }

  // [5] Produkt löschen
  function deleteProductById(productId) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?deleteProduct&id=${productId}`,
        method: 'POST',
        successMessage: 'Product deleted successfully.',
        onSuccess: resolve,
        onError: err => { handleResponse(err, {}); reject(err); }
      });
    });
  }

  // [6] Produkte in Tabelle anzeigen
  function renderProductsTable(products) {
    productsTableBody.innerHTML = '';
    products.forEach(p => {
      const row = document.createElement('tr');
      row.dataset.id = p.id;
      row.innerHTML = `
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>€${Number(p.price).toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>${p.rating ?? '-'}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-product">Edit</button>
          <button class="btn btn-sm btn-danger delete-product">Delete</button>
        </td>
      `;
      productsTableBody.appendChild(row);
    });
  }

  // [7] Modal mit Produktdaten öffnen
  function openProductModal(p = {}) {
    productFormElement.classList.remove('was-validated');
    $('#productForm')[0].reset();

    $('#productId').val(p.id || '');
    $('#productName').val(p.name || '');
    $('#productBrand').val(p.brand || '');
    $('#productCategory').val(p.category || '');
    $('#productSubCategory').val(p.sub_category || '');
    $('#productPrice').val(p.price || '');
    $('#productStock').val(p.stock || '');
    $('#productRating').val(p.rating || '');
    $('#productDescription').val(p.description || '');

    $('#existingImages').empty();
    if (p.image_url) {
      JSON.parse(p.image_url).forEach(src =>
        $('#existingImages').append(`<li class="list-group-item">${src}</li>`)
      );
    }

    if (p.attributes) {
      $('#productAttributes').val(
        Object.entries(JSON.parse(p.attributes))
          .map(([k,v]) => `${k}: ${v}`)
          .join('\n')
      );
    }

    productModal.show();
  }

  // [8] "Hinzufügen" Button gedrückt
  function handleAddProductClick() {
    openProductModal();
  }

  // [9] "Bearbeiten" Button gedrückt
  function handleEditProductClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    fetchProductData(id)
      .then(data => openProductModal(data))
      .catch(() => {});
  }

  // [10] Speichern-Button gedrückt
  function handleSaveProductClick() {
    if (!productFormElement.checkValidity()) {
      productFormElement.classList.add('was-validated');
      return;
    }
    const formData = new FormData(productFormElement);
    const attrs = {};
    $('#productAttributes').val().split(/\r?\n/).forEach(line => {
      const [k,v] = line.split(/:\s*/,2);
      if (v !== undefined) attrs[k.trim()] = v.trim();
    });
    formData.set('attributes', JSON.stringify(attrs));

    const isUpdate = Boolean($('#productId').val());
    submitProductData(formData, isUpdate)
      .then(() => {
        productModal.hide();
        loadAndRenderProducts();
      })
      .catch(() => {});
  }

  // [11] Löschen-Button gedrückt
  function handleDeleteProductClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    deleteProductById(id)
      .then(loadAndRenderProducts)
      .catch(() => {});
  }

  // [12] Events binden
  function bindProductEvents() {
    document.getElementById('addProductBtn')
      .addEventListener('click', handleAddProductClick);
    $(productsTableBody)
      .on('click', '.edit-product', handleEditProductClick)
      .on('click', '.delete-product', handleDeleteProductClick);
    document.getElementById('saveProductBtn')
      .addEventListener('click', handleSaveProductClick);
  }

  // [13] Produkte laden und anzeigen
  function loadAndRenderProducts() {
    fetchAllProducts()
      .then(data => renderProductsTable(data))
      .catch(() => {});
  }

  // [14] Initialisierung beim Laden der Seite
  document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderProducts();
    bindProductEvents();
  });

})(window, jQuery);