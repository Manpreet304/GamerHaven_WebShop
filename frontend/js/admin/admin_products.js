/**
 * js/admin/products/admin_products.js
 * Verantwortlich für Laden, Anzeigen und Verwalten von Produkten im Admin-Bereich
 */
(function(window, $) {
  'use strict';

  // --- Selektoren & Modal-Instanz für Produkte ---
  const productsTableBody   = document.querySelector('#productsTable tbody');
  const productFormElement  = document.getElementById('productForm');
  const productModalElement = document.getElementById('productModal');
  const productModal        = new bootstrap.Modal(productModalElement);

  // --- Promise-basierte API-Funktionen ---
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
      .done(resolve)
      .fail(err => {
        handleResponse(err.responseJSON || {}, {});
        reject(err);
      });
    });
  }

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

  // --- View-/Render-Funktionen: Tabelle & Modal ---
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

  // --- Event-Handler für Add, Edit, Save, Delete ---
  function handleAddProductClick() {
    openProductModal();
  }

  function handleEditProductClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    fetchProductData(id)
      .then(res => openProductModal(res.data))
      .catch(() => {});
  }

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

  function handleDeleteProductClick(e) {
    const id = +e.currentTarget.closest('tr').dataset.id;
    deleteProductById(id)
      .then(loadAndRenderProducts)
      .catch(() => {});
  }

  // --- Events binden: Buttons & Delegation ---
  function bindProductEvents() {
    document.getElementById('addProductBtn')
      .addEventListener('click', handleAddProductClick);
    $(productsTableBody)
      .on('click', '.edit-product', handleEditProductClick)
      .on('click', '.delete-product', handleDeleteProductClick);
    document.getElementById('saveProductBtn')
      .addEventListener('click', handleSaveProductClick);
  }

  // --- Initialisierung: Laden & Events binden ---
  function loadAndRenderProducts() {
    fetchAllProducts()
      .then(res => renderProductsTable(res.data))
      .catch(() => {});
  }

  document.addEventListener('DOMContentLoaded', () => {
    loadAndRenderProducts();
    bindProductEvents();
  });

})(window, jQuery);