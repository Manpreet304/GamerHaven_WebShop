/**
 * js/products/products_api.js
 * Verantwortlich für Laden der Produktdaten und Hinzufügen zum Warenkorb
 */
(function(window, $) {
  'use strict';

  // --- ProductsAPI Objekt ---
  const ProductsAPI = {
    allProductsCache: [],
    filtersInitialized: false,

    /**
     * Lädt Produkte mit optionalen Filtern.
     */
    loadProducts(filters = {}, callbacks = {}) {
      const query = new URLSearchParams(filters).toString();
      const url = `../../backend/api/ApiProducts.php${query ? '?' + query : ''}`;

      apiRequest({
        url,
        method: 'GET',
        onSuccess: res => {
          const products = res.body || [];
          if (!this.filtersInitialized) {
            this.allProductsCache = products.slice();
            this.filtersInitialized = true;
          }
          callbacks.onSuccess?.(products, this.allProductsCache);
        },
        onError: err => {
          callbacks.onError?.(err);
        }
      });
    },

    /**
     * Fügt ein Produkt dem Warenkorb hinzu.
     */
    addToCart(productId, quantity = 1, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiCart.php?addToCart=${productId}`,
        method: 'POST',
        data: { quantity },
        showValidation: false,
        successMessage: 'Product added to cart!',
        onSuccess: res => {
          updateCartCount();
          window.ProductsCart.animateCartButtons(productId, true);
          callbacks.onSuccess?.(res);
        },
        onError: err => {
          handleResponse(err, {
            errorMessage: err.message,
            onError: () => {
              window.ProductsCart.animateCartButtons(productId, false);
              callbacks.onError?.(err);
            }
          });
        }
      });
    }
  };

  window.ProductsAPI = ProductsAPI;
})(window, jQuery);
