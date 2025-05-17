(function(window, $) {
  'use strict';

  const ProductsAPI = {
    allProductsCache: [],
    filtersInitialized: false,

    // Produkte mit optionalen Filtern laden
    loadProducts(filters = {}, callbacks = {}) {
      const query = new URLSearchParams(filters).toString();
      const url = `../../backend/api/ApiProducts.php${query ? '?' + query : ''}`;

      apiRequest({
        url,
        method: 'GET',
        onSuccess: res => {
          const products = res.data || [];
          if (!this.filtersInitialized) {
            this.allProductsCache = products.slice();
            this.filtersInitialized = true;
          }
          callbacks.onSuccess?.(products, this.allProductsCache);
        },
        onError: callbacks.onError
      });
    },

    // Produkt zum Warenkorb hinzufügen
    addToCart(productId, quantity = 1, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiCart.php?addToCart=${productId}`,
        method: 'POST',
        data: { action: 'add', product_id: productId, quantity },
        successMessage: 'Product added to cart!',
        onSuccess: res => {
          updateCartCount();
          window.ProductsCart?.animateCartButtons?.(productId, true);
          callbacks.onSuccess?.(res);
        },
        onError: err => {
          handleResponse(err, {
            errorMessage: err?.data?.error || err?.message || "Could not add product to cart.",
            onError: () => {
              window.ProductsCart?.animateCartButtons?.(productId, false);
              callbacks.onError?.(err);
            }
          });
        }
      });
    }
  };

  // Objekt global verfügbar machen
  window.ProductsAPI = ProductsAPI;

})(window, jQuery);