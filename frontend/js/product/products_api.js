// products.api.js
(function(window, $) {
    const ProductsAPI = {
      allProductsCache: [],
      filtersInitialized: false,
  
      loadProducts(filters = {}, callbacks = {}) {
        const query = new URLSearchParams(filters).toString();
        $.ajax({
          url: `../../backend/api/ApiProducts.php${query ? '?' + query : ''}`,
          method: 'GET',
          success: products => {
            if (!this.filtersInitialized) {
              this.allProductsCache = products.slice();
              this.filtersInitialized = true;
            }
            if (callbacks.onSuccess) callbacks.onSuccess(products, this.allProductsCache);
          },
          error: xhr => {
            if (callbacks.onError) callbacks.onError(xhr);
          }
        });
      },
  
      addToCart(productId, quantity = 1, callbacks = {}) {
        $.ajax({
          url: `../../backend/api/ApiCart.php?addToCart=${productId}`,
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ quantity }),
          success: res => {
            if (callbacks.onSuccess) callbacks.onSuccess(res);
          },
          error: xhr => {
            if (callbacks.onError) callbacks.onError(xhr);
          }
        });
      }
    };
  
    window.ProductsAPI = ProductsAPI;
  })(window, jQuery);
  