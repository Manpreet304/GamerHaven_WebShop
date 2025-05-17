(function(window, $) {
  'use strict';

  const Events = {
    // Alle Event-Listener und Start-Logik setzen
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

      // Suchfeld mit Delay
      let debounce;
      $(document).on('input', '#liveSearchInput', () => {
        clearTimeout(debounce);
        debounce = setTimeout(this.onFilters.bind(this), 300);
      });

      // In Card: Produkt in Warenkorb legen
      $(document).on('click', '.product-card .add-to-cart', function() {
        const card = $(this).closest('.product-card');
        const pid  = +card.data('product-id');
        const qty  = +card.find('.quantity-input').val() || 1;
        window.ProductsAPI.addToCart(pid, qty);
      });

      // In Modal: Produkt in Warenkorb legen
      $(document).on('click', '.product-modal .add-to-cart', function() {
        const modal = $(this).closest('.modal');
        const pid   = +modal.attr('id').replace('productModal', '');
        const qty   = +modal.find('.quantity-input').val() || 1;
        window.ProductsAPI.addToCart(pid, qty);
      });

      // Animation bei View-Details-Klick
      $(document).on('click', '.product-card .view-details', function() {
        const btn = $(this);
        btn.addClass('clicked');
        setTimeout(() => btn.removeClass('clicked'), 350);
      });

      // Drag & Drop für Warenkorb aktivieren
      window.ProductsCart.initDragDrop();

      // Produkte laden
      this.load();
    },

    // Filter sammeln & Produkte neu laden
    onFilters() {
      const filters = window.ProductsFilters.collectFilters();
      const term    = $('#liveSearchInput').val().trim();
      if (term) filters.search = term;
      this.load(filters);
    },

    // Produkte von API holen und rendern
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
    }
  };

  // Init bei DOM ready
  $(document).ready(() => Events.init());

})(window, jQuery);