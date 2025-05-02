// products.api.js
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
        onSuccess: (res) => {
          const products = res.body || [];

          if (!this.filtersInitialized) {
            this.allProductsCache = products.slice();
            this.filtersInitialized = true;
          }

          if (callbacks.onSuccess) {
            callbacks.onSuccess(products, this.allProductsCache);
          }
        },
        onError: (err) => {
          if (callbacks.onError) callbacks.onError(err);
        },
        errorMessage: "Failed to load products."
      });
    },

    addToCart(productId, quantity = 1, callbacks = {}) {
      apiRequest({
        url: `../../backend/api/ApiCart.php?addToCart=${productId}`,
        method: 'POST',
        data: { quantity },
        successMessage: "Product added to cart!",
        errorMessage: "Could not add product to cart.",
        onSuccess: (res) => {
          updateCartCount();
          if (callbacks.onSuccess) callbacks.onSuccess(res);
        },
        onError: (err) => {
          if (callbacks.onError) callbacks.onError(err);
        }
      });
    }
  };

  window.ProductsAPI = ProductsAPI;
})(window, jQuery);
