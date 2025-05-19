(function(window, $) {
  'use strict';

  const ProductsAPI = {
    allProductsCache: [],
    filtersInitialized: false,

    // [1] Produkte vom Server laden (optional mit Filtern)
    loadProducts(filters = {}, callbacks = {}) {
      const query = new URLSearchParams(filters).toString();
      const url = `../../backend/api/ApiProducts.php${query ? '?' + query : ''}`;

      apiRequest({
        url,
        method: 'GET',
        onSuccess: products => {
          const resultList = products || [];
          if (!this.filtersInitialized) {
            this.allProductsCache = resultList.slice(); // Kopie für spätere Filter
            this.filtersInitialized = true;
          }
          callbacks.onSuccess?.(resultList, this.allProductsCache);
        },
        onError: err => {
          handleResponse(err, {
            errorMessage: err?.message || "Failed to load products.",
            onError: () => callbacks.onError?.(err)
          });
        }
      });
    },

    // [2] Produkt zum Warenkorb hinzufügen
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

  window.ProductsAPI = ProductsAPI;

})(window, jQuery);
