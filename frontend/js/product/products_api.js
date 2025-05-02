// js/products/products_api.js
(function (window, $) {
  const ProductsAPI = {
    allProductsCache: [],
    filtersInitialized: false,

    loadProducts(filters = {}, callbacks = {}) {
      const query = new URLSearchParams(filters).toString();
      const url = `../../backend/api/ApiProducts.php${query ? '?' + query : ''}`;

      apiRequest({
        url,
        method: 'GET',
        // Im Normalfall zeigt loadProducts keine Toasts, sondern übergibt alles an callbacks
        onSuccess: (res) => {
          const products = res.body || [];

          if (!this.filtersInitialized) {
            this.allProductsCache = products.slice();
            this.filtersInitialized = true;
          }

          callbacks.onSuccess?.(products, this.allProductsCache);
        },
        onError: (err) => {
          // Fehler direkt an callbacks weiterreichen
          callbacks.onError?.(err);
        }
      });
    },

    addToCart(productId, quantity = 1, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiCart.php?addToCart=${productId}`,
        method: 'POST',
        data: { quantity },
        showValidation: false,    // wir handhaben Field-Errors selbst, falls nötig

        // Statischer Erfolgstext für Konsistenz
        successMessage: "Product added to cart!",

        onSuccess: (res) => {
          // Der statische Erfolgstext wird oben bereits angezeigt
          // Nach dem Toast: Zähle nach, animiere Button, rufe callback
          updateCartCount();
          window.ProductsCart.animateCartButtons(productId, true);
          callbacks.onSuccess?.(res);
        },

        onError: (err) => {
          // Immer die genaue Backend-Message anzeigen
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
