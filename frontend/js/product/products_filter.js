/**
 * js/products/products_filters.js
 * Verantwortlich für Sammeln, Zurücksetzen und Rendern der Filter-UI
 */
(function(window, $) {
  'use strict';

  const ProductsFilters = {
    // Aktuelle Filter auslesen
    collectFilters() {
      return {
        category: $('input[name="category"]:checked').val() || '',
        brand:    $('#filter-brand input:checked').map((_, el) => el.value).get().join(','),
        rating:   $('#filter-rating').val() || '',
        stock:    $('#filter-stock').val() || '',
        priceMin: $('#priceMin').val() || '',
        priceMax: $('#priceMax').val() || ''
      };
    },

    // Alle Filter zurücksetzen
    resetAllFilters() {
      $('#filter-category input[type="radio"]').prop('checked', false);
      $('#filter-brand input[type="checkbox"]').prop('checked', false);
      $('#priceMin, #priceMax, #filter-rating, #filter-stock').val('');
    },

    // Filter-Controls rendern
    renderFilters(products, filters = {}) {
      const selectedCategory = filters.category || '';
      const selectedBrands   = (filters.brand || '').split(',');

      const unique = arr => [...new Set(arr.filter(Boolean))];

      const categories = unique(products.map(p => p.category)).sort();
      const catHTML = [
        `<div class="form-check">
           <input class="form-check-input" type="radio" name="category" value="" ${!selectedCategory ? 'checked' : ''}>
           <label class="form-check-label">All Products</label>
         </div>`,
        ...categories.map(cat => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="category" value="${escapeHTML(cat)}" ${cat === selectedCategory ? 'checked' : ''}>
            <label class="form-check-label">${escapeHTML(cat)}</label>
          </div>
        `)
      ];
      $('#filter-category').html(catHTML.join(''));

      const brands = unique(
        (selectedCategory
          ? products.filter(p => p.category === selectedCategory)
          : products
        ).map(p => p.brand)
      ).sort();
      const brandHTML = brands.map(brand => `
        <div class="form-check">
          <input class="form-check-input" type="checkbox" value="${escapeHTML(brand)}" ${selectedBrands.includes(brand) ? 'checked' : ''}>
          <label class="form-check-label">${escapeHTML(brand)}</label>
        </div>
      `);
      $('#filter-brand').html(brandHTML.join(''));
    }
  };

  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, ch =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[ch]
    );
  }

  window.ProductsFilters = ProductsFilters;
})(window, jQuery);
