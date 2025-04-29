// /customer/products_list.js
function initProductList() {
    loadProducts();
  }
  
  // Produkte vom Server laden
  function loadProducts(filters = {}) {
    const query = new URLSearchParams(filters).toString();
  
    $.ajax({
      url: "../../backend/api/ApiProducts.php" + (query ? "?" + query : ""),
      method: "GET",
      success: function (products) {
        if (!window.filtersInitialized) {
          window.allProductsCache = [...products];
          window.filtersInitialized = true;
        }
        renderFilters(window.allProductsCache, filters);
        renderProducts(products);
        setupHoverRotation(products);
      },
      error: function (xhr) {
        handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load products." });
      }
    });
  }
  