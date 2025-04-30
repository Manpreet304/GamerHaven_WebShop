// products.events.js
(function(window, $) {
    const Events = {
      init() {
        // Filter & Suche
        $(document).on("change", "#filter-category input, #filter-brand input, #filter-rating, #filter-stock, #priceMin, #priceMax", this.onFilters.bind(this));
        $("#applyFilters").click(this.onFilters.bind(this));
        $("#resetFilters").click(() => {
          window.ProductsFilters.resetAllFilters();
          this.load();
        });
  
        let debounce;
        $(document).on("input", "#liveSearchInput", () => {
          clearTimeout(debounce);
          debounce = setTimeout(this.onFilters.bind(this), 300);
        });
  
        // Warenkorb-Buttons in Karten
        $(document).on("click", ".product-card .add-to-cart", function() {
          const pid = +$(this).closest(".product-card").data("product-id");
          const qty = +$(this).siblings(".quantity-input").val() || 1;
          Events.addToCart(pid, qty);
        });
  
        // Warenkorb-Buttons im Modal
        $(document).on("click", ".product-modal .add-to-cart", function() {
          const modal = $(this).closest(".modal");
          const pid = +modal.attr("id").replace("productModal", "") || 0;
          const qty = +modal.find(".quantity-input").val() || 1;
          Events.addToCart(pid, qty);
        });
  
        // View-Details „Klick“-Effekt
        $(document).on("click", ".product-card .view-details", function() {
          const btn = $(this);
          btn.addClass("clicked");
          setTimeout(() => btn.removeClass("clicked"), 350);
        });
  
        // Drag & Drop ins Cart
        window.ProductsCart.initDragDrop();
  
        // Initial laden
        this.load();
      },
  
      onFilters() {
        const filters = window.ProductsFilters.collectFilters();
        const term = $("#liveSearchInput").val().trim();
        if (term) filters.search = term;
        this.load(filters);
      },
  
      load(filters = {}) {
        window.ProductsAPI.loadProducts(filters, {
          onSuccess: (products, allCache) => {
            window.ProductsFilters.renderFilters(allCache, filters);
            window.ProductsRender.renderProducts(products);
            window.ProductsRender.setupHoverRotation(products);
          },
          onError: xhr => handleResponse(xhr.responseJSON||{}, {
            errorMessage: "Products could not be loaded."
          })
        });
      },
  
      addToCart(pid, qty) {
        window.ProductsAPI.addToCart(pid, qty, {
          onSuccess: res => handleResponse(res, {
            successMessage: "Product added to cart.",
            onSuccess: () => {
              updateCartCount();
              window.ProductsCart.animateCartButtons(pid, true);
            }
          }),
          onError: xhr => handleResponse(xhr.responseJSON||{}, {
            errorMessage: xhr.status===401 ? "Please login to use the cart." : "An error occurred.",
            onError: () => window.ProductsCart.animateCartButtons(pid, false)
          })
        });
      }
    };
  
    // DOM-Ready
    $(document).ready(() => Events.init());
  })(window, jQuery);
  