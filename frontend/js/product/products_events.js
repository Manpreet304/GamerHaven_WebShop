/**
 * js/products/products_events.js
 * Verantwortlich für Filter-, Such- und Add-to-Cart-Interaktionen
 */
(function(window, $) {
  'use strict';

  const Events = {
    // Initialisiere alle Events
    init() {
      // Filter & Suche
      $(document).on(
        'change',
        '#filter-category input, #filter-brand input, #filter-rating, #filter-stock, #priceMin, #priceMax',
        this.onFilters.bind(this)
      );
      $('#applyFilters').click(this.onFilters.bind(this));
      $('#resetFilters').click(() => {
        window.ProductsFilters.resetAllFilters();
        this.load();
      });
      let debounce;
      $(document).on('input', '#liveSearchInput', () => {
        clearTimeout(debounce);
        debounce = setTimeout(this.onFilters.bind(this), 300);
      });

      // Add-to-Cart in Cards und Modals
      $(document).on('click', '.product-card .add-to-cart', function() {
        const pid = +$(this).closest('.product-card').data('product-id');
        const qty = +$(this).siblings('.quantity-input').val() || 1;
        Events.addToCart(pid, qty);
      });
      $(document).on('click', '.product-modal .add-to-cart', function() {
        const modal = $(this).closest('.modal');
        const pid   = +modal.attr('id').replace('productModal', '');
        const qty   = +modal.find('.quantity-input').val() || 1;
        Events.addToCart(pid, qty);
      });

      // View-Details Klick-Effekt
      $(document).on('click', '.product-card .view-details', function() {
        const btn = $(this);
        btn.addClass('clicked');
        setTimeout(() => btn.removeClass('clicked'), 350);
      });

      // Drag-n-Drop ins Cart
      window.ProductsCart.initDragDrop();

      // Produkte laden
      this.load();
    },

    // Filter anwenden
    onFilters() {
      const filters = window.ProductsFilters.collectFilters();
      const term    = $('#liveSearchInput').val().trim();
      if (term) filters.search = term;
      this.load(filters);
    },

    // Produkte holen und rendern
    load(filters = {}) {
      window.ProductsAPI.loadProducts(filters, {
        onSuccess: (products, cache) => {
          window.ProductsFilters.renderFilters(cache, filters);
          window.ProductsRender.renderProducts(products);
          window.ProductsRender.setupHoverRotation(products);
        },
        onError: err => {
          handleResponse(err, {
            errorMessage: err.message || 'Products could not be loaded.'
          });
        }
      });
    },

    // Produkt in den Warenkorb legen
    addToCart(pid, qty) {
      apiRequest({
        url: `../../backend/api/ApiCart.php?addToCart=${pid}`,
        method: 'POST',
        data: { quantity: qty },
        showValidation: false,
        successMessage: 'Product added to cart.',
        onSuccess: () => {
          updateCartCount();
          window.ProductsCart.animateCartButtons(pid, true);
        },
            onError: () => {
          window.ProductsCart.animateCartButtons(pid, false);
        }
      });
    }    
  };

  $(document).ready(() => Events.init());
})(window, jQuery);
