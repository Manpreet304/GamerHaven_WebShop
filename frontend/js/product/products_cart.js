// products.cart.js
(function(window, $) {
    const ProductsCart = {
      animateCartButtons(productId, success) {
        const buttons = [
          $(`.product-card[data-product-id='${productId}'] .add-to-cart`),
          $(`#productModal${productId} .add-to-cart`)
        ];
        buttons.forEach(btn => {
          btn.removeClass("button-added button-error")
             .addClass(success ? "button-added" : "button-error")
             .html(success
               ? '<i class="bi bi-check-lg me-1"></i> Added'
               : '<i class="bi bi-x-circle me-1"></i> Error'
             );
          setTimeout(() => {
            btn.removeClass("button-added button-error")
               .html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
          }, 2000);
        });
      },
  
      initDragDrop() {
        // Scroll-On-Drag
        $(document).on("dragover", ev => {
          const y = ev.originalEvent.clientY, threshold = 60, speed = 30;
          if (y < threshold) window.scrollBy(0, -speed);
          else if (y > window.innerHeight - threshold) window.scrollBy(0, speed);
        });
  
        // Drop-Zone
        $(document).on("dragover", "#cart-drop-area", ev => {
          ev.preventDefault();
          $(ev.currentTarget).addClass("drag-over");
        });
        $(document).on("dragleave drop", "#cart-drop-area", ev => {
          ev.preventDefault();
          $(ev.currentTarget).removeClass("drag-over");
        });
        $(document).on("drop", "#cart-drop-area", ev => {
          ev.preventDefault();
          const pid = parseInt(ev.originalEvent.dataTransfer.getData("text/plain"), 10);
          if (!isNaN(pid)) {
            window.ProductsAPI.addToCart(pid, 1, {
              onSuccess: () => {
                updateCartCount();
                ProductsCart.animateCartButtons(pid, true);
              },
              onError: () => {
                ProductsCart.animateCartButtons(pid, false);
              }
            });
          }
        });
      }
    };
  
    window.ProductsCart = ProductsCart;
  })(window, jQuery);
  