(function(window, $) {
  'use strict';

  const Events = {
    // [1] Initialisierung (wird beim Laden der Seite aufgerufen)
    init() {
      // [1.1] Filteraktionen binden
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

      // [1.2] Live-Suche mit Verzögerung
      let debounce;
      $(document).on('input', '#liveSearchInput', () => {
        clearTimeout(debounce);
        debounce = setTimeout(this.onFilters.bind(this), 300);
      });

      // [1.3] Produkt in Card zum Warenkorb
      $(document).on('click', '.product-card .add-to-cart', function() {
        const card = $(this).closest('.product-card');
        const pid  = +card.data('product-id');
        const qty  = +card.find('.quantity-input').val() || 1;
        window.ProductsAPI.addToCart(pid, qty);
      });

      // [1.4] Produkt im Modal zum Warenkorb
      $(document).on('click', '.product-modal .add-to-cart', function() {
        const modal = $(this).closest('.modal');
        const pid   = +modal.attr('id').replace('productModal', '');
        const qty   = +modal.find('.quantity-input').val() || 1;
        window.ProductsAPI.addToCart(pid, qty);
      });

      // [1.5] Klickanimation bei Details
      $(document).on('click', '.product-card .view-details', function() {
        const btn = $(this);
        btn.addClass('clicked');
        setTimeout(() => btn.removeClass('clicked'), 350);
      });

      // [1.6] Drag-and-Drop aktivieren
      window.ProductsCart.initDragDrop();

      // [1.7] Produkte initial laden
      this.load();
    },

    // [2] Filter aktualisieren & neu laden
    onFilters() {
      const filters = window.ProductsFilters.collectFilters();
      const term = $('#liveSearchInput').val().trim();
      if (term) filters.search = term;
      this.load(filters);
    },

    // [3] Produkte laden mit optionalen Filtern
    load(filters = {}) {
      window.ProductsAPI.loadProducts(filters, {
        onSuccess: products => {
          window.ProductsFilters.renderFilters(ProductsAPI.allProductsCache, filters);
          window.ProductsRender.renderProducts(products);
          window.ProductsRender.setupHoverRotation(products);
        },
        onError: err => {
          handleResponse(err, {
            errorMessage: err?.message || err?.data?.error || 'Products could not be loaded.'
          });
        }
      });
    }
  };

  // [4] Bei DOM ready starten
  $(document).ready(() => Events.init());

})(window, jQuery);
